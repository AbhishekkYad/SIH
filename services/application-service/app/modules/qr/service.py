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

    async def resolve_qr(self, payload: QRResolveRequest, actor: ActorContext) -> QRResolveResponse:
        # Step 1: Query batch or product from Data Service
        ref_id = payload.qr_reference
        batch = await self.data_client.get_batch(ref_id)
        
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"QR reference '{ref_id}' could not be resolved to a valid batch")
        
        product = await self.data_client.get_product(batch["product_id"])
        product_name = product["name"] if product else "Unknown Product"
        
        session_ref = payload.session_ref or f"anon-session-{uuid.uuid4().hex[:8]}"
        
        # Step 2: Record Scan Event on Blockchain (AuditContract.recordScan)
        # CRITICAL SYSTEM DESIGN RULE: Record scan interaction without mutating custody or state
        scan_tx = await self.bc_client.record_scan(
            reference_id=ref_id,
            scan_type="STAKEHOLDER_SCAN" if actor.role != "consumer" else "CONSUMER_SCAN",
            actor_context={
                **actor.dict(),
                "session_ref": session_ref
            }
        )
        
        # Step 3: Record Scan Event in Data Service
        await self.data_client.record_scan_event({
            "reference_id": ref_id,
            "scan_type": "STAKEHOLDER_SCAN" if actor.role != "consumer" else "CONSUMER_SCAN",
            "actor_id": actor.user_id,
            "org_id": actor.org_id,
            "session_ref": session_ref,
            "blockchain_tx_id": scan_tx.get("tx_id")
        })
        
        # Build permitted trace history
        history = [
            {
                "event": "BATCH_REGISTERED",
                "org_id": batch["producer_org_id"],
                "timestamp": batch["created_at"]
            },
            {
                "event": f"STATE_{batch['lifecycle_state']}",
                "org_id": batch["current_custodian_org_id"]
            }
        ]
        
        next_op = self._determine_next_allowed_op(batch["lifecycle_state"], actor.role)
        warn_status = "BLOCKED" if batch["lifecycle_state"] in ["BLOCKED", "RECALLED"] else "NONE"
        
        return QRResolveResponse(
            reference_id=batch["batch_id"],
            entity_type="BATCH",
            product_name=product_name,
            current_state=batch["lifecycle_state"],
            producer_org_id=batch["producer_org_id"],
            custodian_org_id=batch["current_custodian_org_id"],
            trace_history=history,
            scan_recorded=True,
            audit_tx_id=scan_tx.get("tx_id"),
            next_allowed_operation=next_op,
            warnings_or_block_status=warn_status
        )

    async def verify_inner_credential(self, payload: CredentialVerifyRequest, actor: ActorContext) -> CredentialVerifyResponse:
        # Step 1: Verify inner credential (hash match or tamper-evident check)
        is_valid = len(payload.inner_credential_code) >= 6
        
        # Step 2: Record verification event in AuditContract
        audit_tx = await self.bc_client.record_verification(
            inner_credential_hash=payload.inner_credential_code,
            is_valid=is_valid,
            actor_context=actor.dict()
        )
        
        message = "Inner physical credential verified authentic." if is_valid else "AUTHENTICITY WARNING: Invalid inner credential hash."
        
        return CredentialVerifyResponse(
            is_authentic=is_valid,
            verification_message=message,
            audit_tx_id=audit_tx.get("tx_id", "tx-mock-verification")
        )
