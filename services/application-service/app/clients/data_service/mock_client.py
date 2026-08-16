from typing import Any, Dict, List, Optional
import datetime
import uuid
from app.demo.demo_state import demo_state

class MockDataServiceClient:
    """In-memory Mock DataServiceClient for offline development & independent unit testing.
    Uses the canonical demo state for MOCK_MODE=true."""
    
    @property
    def units(self) -> Dict[str, Any]:
        return demo_state.units

    async def get_organization(self, org_id: str) -> Optional[Dict[str, Any]]:
        return demo_state.organizations.get(org_id)

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        return demo_state.products.get(product_id)

    async def save_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        product_id = product_data.get("product_id") or f"prd-{uuid.uuid4().hex[:8]}"
        record = {
            **product_data,
            "product_id": product_id,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.products[product_id] = record
        return record

    async def get_batch(self, batch_id: str) -> Optional[Dict[str, Any]]:
        return demo_state.batches.get(batch_id)

    async def save_batch(self, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        batch_id = batch_data.get("batch_id") or f"batch-{uuid.uuid4().hex[:8]}"
        record = {
            **batch_data,
            "batch_id": batch_id,
            "lifecycle_state": batch_data.get("lifecycle_state", "REGISTERED"),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.batches[batch_id] = record
        return record

    async def update_batch_state(self, batch_id: str, state: str, custodian_org_id: Optional[str] = None) -> Dict[str, Any]:
        if batch_id not in demo_state.batches:
            raise KeyError(f"Batch {batch_id} not found in mock data store")
        
        demo_state.batches[batch_id]["lifecycle_state"] = state
        if custodian_org_id:
            demo_state.batches[batch_id]["current_custodian_org_id"] = custodian_org_id
        return demo_state.batches[batch_id]

    async def get_parents(self, batch_id: str) -> List[Dict[str, Any]]:
        parents = [edge["parent_batch_id"] for edge in demo_state.lineage_edges if edge["child_batch_id"] == batch_id]
        return [demo_state.batches[p] for p in parents if p in demo_state.batches]

    async def get_unit(self, unit_id: str) -> Optional[Dict[str, Any]]:
        return demo_state.units.get(unit_id)

    async def save_unit(self, unit_data: Dict[str, Any]) -> Dict[str, Any]:
        unit_id = unit_data.get("unit_id") or f"unit-{uuid.uuid4().hex[:8]}"
        record = {
            **unit_data,
            "unit_id": unit_id,
            "status": unit_data.get("status", "AVAILABLE"),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.units[unit_id] = record
        return record

    async def get_children(self, batch_id: str) -> List[Dict[str, Any]]:
        children = [edge["child_batch_id"] for edge in demo_state.lineage_edges if edge["parent_batch_id"] == batch_id]
        return [demo_state.batches[c] for c in children if c in demo_state.batches]

    async def save_lineage_edge(self, parent_batch_id: str, child_batch_id: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        edge = {
            "edge_id": f"edge-{uuid.uuid4().hex[:8]}",
            "parent_batch_id": parent_batch_id,
            "child_batch_id": child_batch_id,
            "metadata": metadata or {},
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.lineage_edges.append(edge)
        return edge

    async def save_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        event_id = event_data.get("event_id") or f"evt-{uuid.uuid4().hex[:8]}"
        record = {
            **event_data,
            "event_id": event_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.events.append(record)
        return record

    async def save_custody_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.save_event(event_data)

    async def record_scan_event(self, scan_data: Dict[str, Any]) -> Dict[str, Any]:
        scan_id = f"scan-{uuid.uuid4().hex[:8]}"
        record = {
            "scan_id": scan_id,
            **scan_data,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.scan_events.append(record)
        return record

    async def upload_evidence_to_ipfs(self, file_name: str, content: bytes) -> Dict[str, Any]:
        cid = f"Qm{uuid.uuid4().hex[:32]}"
        record = {
            "cid": cid,
            "filename": file_name,
            "size_bytes": len(content),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.ipfs_storage[cid] = record
        return record

    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        incident_id = incident_data.get("incident_id") or f"inc-{uuid.uuid4().hex[:8]}"
        record = {
            **incident_data,
            "incident_id": incident_id,
            "status": incident_data.get("status", "SUBMITTED"),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.incidents[incident_id] = record
        return record

    async def save_recall_action(self, recall_data: Dict[str, Any]) -> Dict[str, Any]:
        recall_id = recall_data.get("recall_id") or f"rcl-{uuid.uuid4().hex[:8]}"
        record = {
            **recall_data,
            "recall_id": recall_id,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        demo_state.recalls[recall_id] = record
        return record

    async def get_lineage(self, batch_id: str) -> Optional[Dict[str, Any]]:
        # Build mock lineage from events
        batch_events = [e for e in demo_state.events if e.get("reference_id") == batch_id]
        batch_scans = [s for s in demo_state.scan_events if s.get("reference_id") == batch_id]
        return {
            "parents": await self.get_parents(batch_id),
            "children": await self.get_children(batch_id),
            "events": batch_events,
            "scans": batch_scans
        }

    async def get_incidents(self, batch_or_unit_id: str) -> List[Dict[str, Any]]:
        return [inc for inc in demo_state.incidents.values() if inc.get("batch_id") == batch_or_unit_id]
