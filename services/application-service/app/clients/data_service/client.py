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
                f"{self.base_url}/internal/events/ledger-sync", 
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
