from typing import Any, Dict, List, Optional
import httpx
import uuid
from app.config import settings

class BlockchainServiceClient:
    """Client for communicating with Developer 2's Blockchain Service (Hyperledger Fabric Gateway & Chaincode)."""
    
    def __init__(self, base_url: str):
        self.base_url = base_url

    def _get_headers(self, actor_context: Dict[str, Any]) -> Dict[str, str]:
        fabric_msp_id = actor_context.get("fabric_msp_id")
        if not fabric_msp_id:
            raise ValueError("fabric_msp_id is missing from actor_context")
            
        return {
            "Authorization": f"Bearer {settings.INTERNAL_API_KEY}",
            "X-Actor-MSP": fabric_msp_id,
            "X-Idempotency-Key": str(uuid.uuid4()),
            "Content-Type": "application/json"
        }

    async def register_product(self, product_id: str, name: str, sku: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "productId": product_id,
                "name": name,
                "productType": sku  # the handoff says 'productType' is expected, we'll map sku to it
            }
            res = await client.post(
                f"{self.base_url}/internal/transactions/products",
                json=payload,
                headers=self._get_headers(actor_context)
            )
            res.raise_for_status()
            data = res.json()
            if data.get("status") != "COMMITTED":
                raise Exception(f"Transaction not committed: {data}")
            return data

    async def register_batch(self, batch_id: str, product_id: str, quantity: float, unit_of_measure: str, actor_context: Dict[str, Any], metadataJson: str = '') -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "batchId": batch_id,
                "productId": product_id,
                "quantity": quantity,
                "metadataJson": metadataJson
            }
            res = await client.post(
                f"{self.base_url}/internal/transactions/batches",
                json=payload,
                headers=self._get_headers(actor_context)
            )
            res.raise_for_status()
            data = res.json()
            if data.get("status") != "COMMITTED":
                raise Exception(f"Transaction not committed: {data}")
            return data

    async def validate_batch(self, batch_id: str, actor_context: Dict[str, Any], metadataJson: str = '') -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "batchId": batch_id,
                "validationResult": "VALID",
                "metadataJson": metadataJson
            }
            res = await client.post(
                f"{self.base_url}/internal/transactions/batches/{batch_id}/validate",
                json=payload,
                headers=self._get_headers(actor_context)
            )
            res.raise_for_status()
            data = res.json()
            if data.get("status") != "COMMITTED":
                raise Exception(f"Transaction not committed: {data}")
            return data

    async def receive_batch(self, batch_id: str, actor_context: Dict[str, Any], metadataJson: str = '') -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "batchId": batch_id,
                "metadataJson": metadataJson
            }
            res = await client.post(
                f"{self.base_url}/internal/transactions/receive",
                json=payload,
                headers=self._get_headers(actor_context)
            )
            res.raise_for_status()
            data = res.json()
            if data.get("status") != "COMMITTED":
                raise Exception(f"Transaction not committed: {data}")
            return data

    async def transfer_batch(self, batch_id: str, to_org_id: str, actor_context: Dict[str, Any], metadataJson: str = '') -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "batchId": batch_id,
                "targetOrg": to_org_id,
                "metadataJson": metadataJson
            }
            res = await client.post(
                f"{self.base_url}/internal/transactions/transfer",
                json=payload,
                headers=self._get_headers(actor_context)
            )
            res.raise_for_status()
            data = res.json()
            if data.get("status") != "COMMITTED":
                raise Exception(f"Transaction not committed: {data}")
            return data

    async def create_transformation(self, parent_batch_ids: List[str], child_batch_id: str, actor_context: Dict[str, Any], metadataJson: str = '') -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "parentBatchIds": parent_batch_ids,
                "childBatchId": child_batch_id,
                "newProductId": "derived-prod-xyz", # just placeholder or need it in args
                "metadataJson": metadataJson
            }
            res = await client.post(
                f"{self.base_url}/internal/transactions/transform",
                json=payload,
                headers=self._get_headers(actor_context)
            )
            res.raise_for_status()
            data = res.json()
            if data.get("status") != "COMMITTED":
                raise Exception(f"Transaction not committed: {data}")
            return data
