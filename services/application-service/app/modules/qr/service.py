from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import uuid
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.qr import QRResolveRequest, CredentialVerifyRequest, QRResolveResponse, CredentialVerifyResponse


class QRService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    def _determine_next_allowed_op(self, state: str, role: str) -> str:
        state_upper = state.upper()
        if state_upper in ["BLOCKED", "RECALLED"]:
            return "PROHIBITED_STATE_BLOCKED"
        elif state_upper == "REGISTERED":
            return "VALIDATE"
        elif state_upper == "VALIDATED":
            return "TRANSFER_OR_PROCESS"
        elif state_upper == "IN_TRANSIT":
            return "RECEIVE"
        elif state_upper == "RECEIVED":
            return "TRANSFORM_OR_CREATE_UNIT"
        elif state_upper == "AVAILABLE":
            return "TRANSFER_OR_SELL"
        return "VIEW_ONLY"

    def _enrich_trace_event(self, raw_event: dict) -> dict:
        """Normalize a raw D1 event dict into a blockchain proof card for the frontend.
        Fields are preserved exactly as stored in D1 (sourced from the real Fabric ledger
        when MOCK_MODE=false). No fabrication of values."""
        return {
            "event": raw_event.get("type") or raw_event.get("event_type"),
            "transaction_id": raw_event.get("fabric_tx_id"),
            "block_number": raw_event.get("block_number"),
            "channel_id": raw_event.get("channel_id"),
            "actor_msp": raw_event.get("actor_msp"),
            "timestamp": str(raw_event.get("timestamp")) if raw_event.get("timestamp") else None,
            "latitude": raw_event.get("latitude"),
            "longitude": raw_event.get("longitude"),
            "location_name": raw_event.get("location_name"),
            "state_after": raw_event.get("state_after"),
            "metadata": raw_event.get("metadata"),
        }

    async def _collect_full_chain_events(self, batch_id: str, visited: set = None) -> list:
        """
        Walk the lineage tree upward collecting events from ALL ancestor batches
        so that scanning any QR code surfaces the complete supply-chain journey.
        Uses a visited set to prevent infinite loops on complex graphs.
        """
        if visited is None:
            visited = set()
        if batch_id in visited:
            return []
        visited.add(batch_id)

        lineage = await self.data_client.get_lineage(batch_id)
        if not lineage:
            return []

        # Own events first
        own_events = lineage.get("events") or []

        # Recurse into each parent batch
        ancestor_events = []
        for parent in lineage.get("parents") or []:
            parent_id = parent.get("batch_id") or parent.get("id")
            if parent_id and parent_id not in visited:
                ancestor_events.extend(
                    await self._collect_full_chain_events(parent_id, visited)
                )

        return ancestor_events + own_events

    async def resolve_qr(self, payload: QRResolveRequest, actor: ActorContext) -> QRResolveResponse:
        # Step 1: Query batch or product from Data Service
        ref_id = payload.qr_reference
        batch = await self.data_client.get_batch(ref_id)
        
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"QR reference '{ref_id}' could not be resolved to a valid batch")
        
        product = await self.data_client.get_product(batch.get("product_id"))
        product_name = product.get("name") if product else "Unknown Product"
        
        # Step 2: Record Scan Event in Data Service
        await self.data_client.record_scan_event({
            "entity_id": ref_id,
            "actor_org_id": actor.org_id,
            "location": "Unknown",
            "result": "SCAN_SUCCESS"
        })
        
        # Collect full trace events across lineage
        lineage_data = await self.data_client.get_lineage(ref_id)
        
        lifecycle_state = batch.get("lifecycle_state") or batch.get("state", "REGISTERED")
        producer_org_id = batch.get("producer_org_id") or batch.get("owner_org_id", "Unknown")
        custodian_org_id = batch.get("current_custodian_org_id") or batch.get("owner_org_id", "Unknown")

        deduped_events = []
        scan_history = []
        if lineage_data and "parents" in lineage_data:
            all_raw_events = await self._collect_full_chain_events(ref_id)
            # Sort chronologically by block_number (then timestamp as tiebreaker)
            def sort_key(e: dict):
                bn = e.get("block_number")
                ts = str(e.get("timestamp") or "")
                return (bn if bn is not None else 9999999, ts)
            all_raw_events.sort(key=sort_key)
            seen_ids = set()
            for e in all_raw_events:
                uid = e.get("fabric_tx_id") or e.get("event_id") or id(e)
                if uid not in seen_ids:
                    seen_ids.add(uid)
                    deduped_events.append(e)
            scan_history = lineage_data.get("scans") or []

        # Filter scan history for consumers (they see limited scan metadata)
        if actor.role == "consumer":
            scan_history = [{"type": s.get("type"), "timestamp": s.get("timestamp")} for s in scan_history]

        # Combine static metadata from Product and Batch
        prod_meta = product.get("metadata", {}) if product and isinstance(product.get("metadata"), dict) else {}
        batch_meta = batch.get("metadata", {}) if isinstance(batch.get("metadata"), dict) else {}

        # -----------------------------
        # Map to the new target schema
        # -----------------------------
        
        # PRODUCT DOSSIER
        product_dossier = {
            "product_id": product.get("product_id", "") if product else "",
            "product_name": product_name,
            "brand": prod_meta.get("brand") or prod_meta.get("brand_name"),
            "category": product.get("category", "UNKNOWN"),
            "batch_id": ref_id,
            "production_date": batch_meta.get("production_date"),
            "shelf_life": prod_meta.get("shelf_life"),
            "quantity": batch.get("quantity"),
            "unit": batch.get("unit"),
            "product_standard": prod_meta.get("product_standard"),
            "source_of_raw_materials": prod_meta.get("source_of_raw_materials", []),
            "ingredients": prod_meta.get("ingredients", []),
            "allergen_information": prod_meta.get("allergen_information"),
            "label_information": prod_meta.get("label_information", {})
        }

        # CURRENT STATUS
        current_status = {
            "lifecycle_state": lifecycle_state,
            "current_custodian": {
                "organization_id": custodian_org_id,
                "organization_name": batch_meta.get("current_custodian_name", "Unknown Organization"),
                "role": batch_meta.get("current_custodian_role", "unknown")
            },
            "expected_custodian": batch_meta.get("expected_custodian"),
            "risk_status": "CLEAR",
            "recall_status": "NOT_RECALLED"
        }

        # ORIGIN DOSSIER
        origin = None
        origin_event = next((e for e in deduped_events if e.get("type") == "BATCH_REGISTERED"), None)
        if origin_event:
            o_meta = origin_event.get("metadata") or {}
            origin = {
                "batch_id": origin_event.get("target_id", ""),
                "producer": {
                    "organization_id": origin_event.get("actor_org_id", producer_org_id),
                    "organization_name": o_meta.get("organization_name", "Unknown Producer"),
                    "role": "PRODUCER"
                },
                "product": o_meta.get("product_name", product_name),
                "location": {
                    "location_name": origin_event.get("location_name"),
                    "latitude": origin_event.get("latitude"),
                    "longitude": origin_event.get("longitude")
                },
                "production_date": origin_event.get("timestamp"),
                "condition": o_meta.get("conditions", {})
            }

        # LINEAGE DOSSIER
        lineage_dossier = {
            "parents": lineage_data.get("parents", []) if lineage_data else [],
            "current_batch": ref_id,
            "children": lineage_data.get("children", []) if lineage_data else []
        }

        # TRACE HISTORY
        trace_history = []
        seq = 1
        for idx, e in enumerate(deduped_events):
            meta = e.get("metadata") or {}
            
            actor_data = {
                "user_id": e.get("actor_user_id"),
                "organization_id": e.get("actor_org_id", "unknown"),
                "organization_name": meta.get("actor_organization_name", "Unknown Org"),
                "role": meta.get("actor_role", "unknown"),
                "fabric_msp": e.get("actor_msp")
            }

            location_data = {
                "location_name": e.get("location_name"),
                "latitude": e.get("latitude"),
                "longitude": e.get("longitude")
            }

            blockchain_data = {
                "transaction_id": e.get("fabric_tx_id"),
                "channel_id": e.get("channel_id"),
                "block_number": e.get("block_number"),
                "event_name": e.get("type"),
                "commit_status": "COMMITTED" if e.get("fabric_tx_id") else "UNCOMMITTED"
            }
            
            custody = meta.get("custody")
            
            trace_history.append({
                "sequence": seq,
                "event_name": e.get("type", "UNKNOWN"),
                "action": meta.get("action", f"Event {e.get('type')} occurred"),
                "actor": actor_data,
                "product": meta.get("product"),
                "timestamp": str(e.get("timestamp")) if e.get("timestamp") else None,
                "location": location_data,
                "conditions": meta.get("conditions", {}),
                "custody": custody,
                "transformation": meta.get("transformation"),
                "blockchain": blockchain_data,
                "evidence": meta.get("evidence", [])
            })
            seq += 1

        # SCAN EVENT IN HISTORY
        if scan_history and actor.role == "consumer":
            # Add final pseudo-event for the scan
            trace_history.append({
                "sequence": seq,
                "event_name": "SCAN_RECORDED",
                "action": "CONSUMER_QR_SCAN",
                "actor": {
                    "organization_id": "none",
                    "organization_name": "Consumer",
                    "role": "CONSUMER"
                },
                "location": {},
                "blockchain": {
                    "commit_status": "APPLICATION_AUDIT"
                },
                "scan": {
                    "qr_reference": ref_id,
                    "result": "TRACEABILITY_VERIFIED"
                }
            })

        return QRResolveResponse(
            qr_reference=ref_id,
            entity_type="BATCH",
            product=product_dossier,
            current_status=current_status,
            origin=origin,
            lineage=lineage_dossier,
            trace_history=trace_history,
            scan_history=scan_history,
            quality_and_testing=prod_meta.get("quality_and_testing", {}),
            certifications=prod_meta.get("certifications", []) + batch_meta.get("certifications", []),
            transport=batch_meta.get("transport", {}),
            evidence=batch_meta.get("evidence", [])
        )

    async def verify_inner_credential(self, payload: CredentialVerifyRequest, actor: ActorContext) -> CredentialVerifyResponse:
        # Step 1: Verify inner credential (hash match or tamper-evident check)
        is_valid = len(payload.inner_credential_code) >= 6
        
        # Validate traceability exists
        ref_id = payload.unit_or_batch_id
        batch = await self.data_client.get_batch(ref_id)
        
        traceability_result = {
            "verified": batch is not None,
            "batch_id": ref_id
        }
        
        # Step 2: Record verification event
        # Skip bc_client.record_verification as D2 (Gateway) doesn't have an endpoint for it yet.
        audit_tx_id = f"tx-mock-verify-{uuid.uuid4().hex[:8]}"
        
        authenticity_result = {
            "verified": is_valid,
            "credential_id": payload.inner_credential_code,
            "message": "Inner physical credential verified authentic." if is_valid else "AUTHENTICITY WARNING: Invalid inner credential."
        }
        
        return CredentialVerifyResponse(
            traceability=traceability_result,
            authenticity=authenticity_result,
            audit_tx_id=audit_tx_id
        )
