from typing import Any, Dict, List, Optional
import httpx


class DataServiceClient:
    """Client for communicating with Developer 1's Data & Storage Service (PostgreSQL/Redis/IPFS)."""
    
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/products/{product_id}")
            if res.status_code == 200:
                return res.json()
            return None

    async def save_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/products", json=product_data)
            res.raise_for_status()
            return res.json()

    async def get_batch(self, batch_id: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/batches/{batch_id}")
            if res.status_code == 200:
                return res.json()
            return None

    async def save_batch(self, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/batches", json=batch_data)
            res.raise_for_status()
            return res.json()

    async def update_batch_state(self, batch_id: str, state: str, custodian_org_id: Optional[str] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {"lifecycle_state": state}
            if custodian_org_id:
                payload["current_custodian_org_id"] = custodian_org_id
            res = await client.patch(f"{self.base_url}/batches/{batch_id}", json=payload)
            res.raise_for_status()
            return res.json()

    async def get_parents(self, batch_id: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/lineage/{batch_id}/parents")
            if res.status_code == 200:
                return res.json()
            return []

    async def get_children(self, batch_id: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/lineage/{batch_id}/children")
            if res.status_code == 200:
                return res.json()
            return []

    async def save_lineage_edge(self, parent_batch_id: str, child_batch_id: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "parent_batch_id": parent_batch_id,
                "child_batch_id": child_batch_id,
                "metadata": metadata or {}
            }
            res = await client.post(f"{self.base_url}/lineage", json=payload)
            res.raise_for_status()
            return res.json()

    async def record_scan_event(self, scan_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/scan-events", json=scan_data)
            res.raise_for_status()
            return res.json()

    async def upload_evidence_to_ipfs(self, file_name: str, content: bytes) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            files = {"file": (file_name, content)}
            res = await client.post(f"{self.base_url}/ipfs/upload", files=files)
            res.raise_for_status()
            return res.json()

    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/incidents", json=incident_data)
            res.raise_for_status()
            return res.json()

    async def save_recall_action(self, recall_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/recalls", json=recall_data)
            res.raise_for_status()
            return res.json()
