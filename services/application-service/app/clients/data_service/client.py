from typing import Any, Dict, List, Optional
import httpx
from app.config import settings

class DataServiceClient:
    """Client for communicating with Developer 1's Data & Storage Service (PostgreSQL/Redis/IPFS)."""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.internal_headers = {
            "X-Internal-API-Key": settings.INTERNAL_API_KEY
        }

    async def get_organization(self, org_id: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.base_url}/internal/identity/organizations/{org_id}",
                headers=self.internal_headers
            )
            if res.status_code == 200:
                return res.json().get("data")
            return None

    async def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/internal/products/{product_id}", headers=self.internal_headers)
            if res.status_code == 200:
                return res.json().get("data")
            return None

    async def save_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/internal/products", json=product_data, headers=self.internal_headers)
            res.raise_for_status()
            return res.json().get("data", res.json())

    async def get_batch(self, batch_id: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/internal/batches/{batch_id}", headers=self.internal_headers)
            if res.status_code == 200:
                return res.json().get("data")
            return None

    async def save_batch(self, batch_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/internal/batches", json=batch_data, headers=self.internal_headers)
            res.raise_for_status()
            return res.json().get("data", res.json())

    async def save_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/internal/events", 
                json=event_data, 
                headers=self.internal_headers
            )
            res.raise_for_status()
            return res.json().get("data", res.json())

    async def save_custody_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/internal/events/custody", 
                json=event_data, 
                headers=self.internal_headers
            )
            res.raise_for_status()
            return res.json().get("data", res.json())

    async def get_lineage(self, batch_id: str) -> Optional[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.base_url}/internal/lineage/{batch_id}",
                headers=self.internal_headers
            )
            if res.status_code == 200:
                return res.json().get("data")
            return None

    async def get_parents(self, batch_id: str) -> List[Dict[str, Any]]:
        lineage = await self.get_lineage(batch_id)
        if lineage and "parents" in lineage:
            return lineage["parents"]
        return []

    async def get_children(self, batch_id: str) -> List[Dict[str, Any]]:
        lineage = await self.get_lineage(batch_id)
        if lineage and "children" in lineage:
            return lineage["children"]
        return []

    async def record_scan_event(self, scan_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/internal/events/scans",
                json=scan_data,
                headers=self.internal_headers
            )
            if res.status_code == 201:
                return res.json().get("data", res.json())
            # For robustness, if D1 endpoint is missing, return mock
            return scan_data

    async def upload_evidence_to_ipfs(self, file_name: str, content: bytes) -> Dict[str, Any]:
        import base64
        payload = {
            "filename": file_name,
            "content_base64": base64.b64encode(content).decode('utf-8')
        }
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/internal/evidence/upload",
                json=payload,
                headers=self.internal_headers
            )
            if res.status_code == 201:
                return res.json().get("data", res.json())
            # Fallback if D1 not fully implemented yet
            return {"cid": f"QmRealModeFallback{file_name[:5]}"}

    async def get_incidents(self, batch_or_unit_id: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{self.base_url}/internal/incidents?target_id={batch_or_unit_id}",
                headers=self.internal_headers
            )
            if res.status_code == 200:
                return res.json().get("data", [])
            return []

    async def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{self.base_url}/internal/incidents",
                json=incident_data,
                headers=self.internal_headers
            )
            if res.status_code == 201:
                return res.json().get("data", res.json())
            return incident_data
