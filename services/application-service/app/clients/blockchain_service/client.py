from typing import Any, Dict, Optional
import httpx


class BlockchainServiceClient:
    """Client for communicating with Developer 2's Blockchain Service (Hyperledger Fabric Gateway & Chaincode)."""
    
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def submit_transaction(self, contract: str, function: str, args: Dict[str, Any], actor_context: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            payload = {
                "contract_name": contract,
                "function_name": function,
                "arguments": args,
                "actor_context": actor_context
            }
            res = await client.post(f"{self.base_url}/transactions/submit", json=payload)
            res.raise_for_status()
            return res.json()

    # Convenience helper functions mapped to chaincode logical contracts
    async def register_product(self, product_id: str, name: str, sku: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="TraceabilityContract",
            function="registerProduct",
            args={"product_id": product_id, "name": name, "sku": sku},
            actor_context=actor_context
        )

    async def register_batch(self, batch_id: str, product_id: str, quantity: float, unit_of_measure: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="TraceabilityContract",
            function="registerBatch",
            args={
                "batch_id": batch_id,
                "product_id": product_id,
                "quantity": quantity,
                "unit_of_measure": unit_of_measure
            },
            actor_context=actor_context
        )

    async def validate_batch(self, batch_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="TraceabilityContract",
            function="validateBatch",
            args={"batch_id": batch_id},
            actor_context=actor_context
        )

    async def receive_batch(self, batch_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="TraceabilityContract",
            function="receiveBatch",
            args={"batch_id": batch_id},
            actor_context=actor_context
        )

    async def transfer_batch(self, batch_id: str, to_org_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="TraceabilityContract",
            function="transferBatch",
            args={"batch_id": batch_id, "to_org_id": to_org_id},
            actor_context=actor_context
        )

    async def create_transformation(self, parent_batch_ids: list, child_batch_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="TraceabilityContract",
            function="createTransformation",
            args={"parent_batch_ids": parent_batch_ids, "child_batch_id": child_batch_id},
            actor_context=actor_context
        )

    async def record_scan(self, reference_id: str, scan_type: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="AuditContract",
            function="recordScan",
            args={"reference_id": reference_id, "scan_type": scan_type},
            actor_context=actor_context
        )

    async def record_verification(self, inner_credential_hash: str, is_valid: bool, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="AuditContract",
            function="recordVerification",
            args={"inner_credential_hash": inner_credential_hash, "is_valid": is_valid},
            actor_context=actor_context
        )

    async def block_batch(self, batch_id: str, reason: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="IncidentContract",
            function="blockBatch",
            args={"batch_id": batch_id, "reason": reason},
            actor_context=actor_context
        )

    async def create_recall_action(self, recall_id: str, affected_scope_ids: list, reason: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction(
            contract="IncidentContract",
            function="createRecallAction",
            args={"recall_id": recall_id, "affected_scope_ids": affected_scope_ids, "reason": reason},
            actor_context=actor_context
        )
