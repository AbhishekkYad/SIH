from typing import Any, Dict, List, Optional
import datetime
import uuid


class MockDataServiceClient:
    """In-memory Mock DataServiceClient for offline development & independent unit testing."""
    
    def __init__(self):
        self.products: Dict[str, Dict[str, Any]] = {
            "prd-oj-001": {
                "product_id": "prd-oj-001",
                "name": "Fresh Premium Orange Juice",
                "sku": "SKU-ORJ-500ML",
                "category": "BEVERAGE",
                "producer_org_id": "org-citrus-farms",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        }
        self.batches: Dict[str, Dict[str, Any]] = {
            "batch-raw-101": {
                "batch_id": "batch-raw-101",
                "product_id": "prd-oj-001",
                "producer_org_id": "org-citrus-farms",
                "current_custodian_org_id": "org-citrus-farms",
                "lifecycle_state": "REGISTERED",
                "quantity": 1000.0,
                "unit_of_measure": "KG",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
        }
        self.units: Dict[str, Dict[str, Any]] = {}
        self.lineage_edges: List[Dict[str, Any]] = []
        self.scan_events: List[Dict[str, Any]] = []
        self.incidents: Dict[str, Dict[str, Any]] = {}
        self.recalls: Dict[str, Dict[str, Any]] = {}
        self.ipfs_storage: Dict[str, Dict[str, Any]] = {}

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        return self.products.get(product_id)

    async def save_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        product_id = product_data.get("product_id") or f"prd-{uuid.uuid4().hex[:8]}"
        record = {
            **product_data,
            "product_id": product_id,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.products[product_id] = record
        return record

    async def get_batch(self, batch_id: str) -> Optional[Dict[str, Any]]:
        return self.batches.get(batch_id)

    async def save_batch(self, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        batch_id = batch_data.get("batch_id") or f"batch-{uuid.uuid4().hex[:8]}"
        record = {
            **batch_data,
            "batch_id": batch_id,
            "lifecycle_state": batch_data.get("lifecycle_state", "REGISTERED"),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.batches[batch_id] = record
        return record

    async def update_batch_state(self, batch_id: str, state: str, custodian_org_id: Optional[str] = None) -> Dict[str, Any]:
        if batch_id not in self.batches:
            raise KeyError(f"Batch {batch_id} not found in mock data store")
        
        self.batches[batch_id]["lifecycle_state"] = state
        if custodian_org_id:
            self.batches[batch_id]["current_custodian_org_id"] = custodian_org_id
        return self.batches[batch_id]

    async def get_parents(self, batch_id: str) -> List[Dict[str, Any]]:
        parents = [edge["parent_batch_id"] for edge in self.lineage_edges if edge["child_batch_id"] == batch_id]
        return [self.batches[p] for p in parents if p in self.batches]

    async def get_children(self, batch_id: str) -> List[Dict[str, Any]]:
        children = [edge["child_batch_id"] for edge in self.lineage_edges if edge["parent_batch_id"] == batch_id]
        return [self.batches[c] for c in children if c in self.batches]

    async def save_lineage_edge(self, parent_batch_id: str, child_batch_id: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        edge = {
            "edge_id": f"edge-{uuid.uuid4().hex[:8]}",
            "parent_batch_id": parent_batch_id,
            "child_batch_id": child_batch_id,
            "metadata": metadata or {},
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.lineage_edges.append(edge)
        return edge

    async def record_scan_event(self, scan_data: Dict[str, Any]) -> Dict[str, Any]:
        scan_id = f"scan-{uuid.uuid4().hex[:8]}"
        record = {
            "scan_id": scan_id,
            **scan_data,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.scan_events.append(record)
        return record

    async def upload_evidence_to_ipfs(self, file_name: str, content: bytes) -> Dict[str, Any]:
        cid = f"Qm{uuid.uuid4().hex[:32]}"
        record = {
            "cid": cid,
            "filename": file_name,
            "size_bytes": len(content),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.ipfs_storage[cid] = record
        return record

    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        incident_id = incident_data.get("incident_id") or f"inc-{uuid.uuid4().hex[:8]}"
        record = {
            **incident_data,
            "incident_id": incident_id,
            "status": incident_data.get("status", "SUBMITTED"),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.incidents[incident_id] = record
        return record

    async def save_recall_action(self, recall_data: Dict[str, Any]) -> Dict[str, Any]:
        recall_id = recall_data.get("recall_id") or f"rcl-{uuid.uuid4().hex[:8]}"
        record = {
            **recall_data,
            "recall_id": recall_id,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.recalls[recall_id] = record
        return record
