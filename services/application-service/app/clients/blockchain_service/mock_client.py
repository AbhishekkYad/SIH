from typing import Any, Dict, List
import datetime
import uuid


class MockBlockchainServiceClient:
    """In-memory Mock BlockchainServiceClient for Hyperledger Fabric Gateway & Chaincode simulation."""

    def __init__(self):
        self.committed_transactions: List[Dict[str, Any]] = []

    async def submit_transaction(self, contract: str, function: str, args: Dict[str, Any], actor_context: Dict[str, Any]) -> Dict[str, Any]:
        tx_id = f"tx-{uuid.uuid4().hex}"
        block_number = len(self.committed_transactions) + 1001
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        record = {
            "tx_id": tx_id,
            "block_number": block_number,
            "contract": contract,
            "function": function,
            "args": args,
            "actor_context": actor_context,
            "status": "COMMITTED",
            "timestamp": timestamp
        }
        self.committed_transactions.append(record)
        return {
            "status": "SUCCESS",
            "tx_id": tx_id,
            "block_number": block_number,
            "contract_name": contract,
            "function_name": function,
            "committed_at": timestamp
        }

    async def register_product(self, product_id: str, name: str, sku: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("TraceabilityContract", "registerProduct", {"product_id": product_id, "name": name, "sku": sku}, actor_context)

    async def register_batch(self, batch_id: str, product_id: str, quantity: float, unit_of_measure: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("TraceabilityContract", "registerBatch", {"batch_id": batch_id, "product_id": product_id, "quantity": quantity, "unit_of_measure": unit_of_measure}, actor_context)

    async def validate_batch(self, batch_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("TraceabilityContract", "validateBatch", {"batch_id": batch_id}, actor_context)

    async def receive_batch(self, batch_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("TraceabilityContract", "receiveBatch", {"batch_id": batch_id}, actor_context)

    async def transfer_batch(self, batch_id: str, to_org_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("TraceabilityContract", "transferBatch", {"batch_id": batch_id, "to_org_id": to_org_id}, actor_context)

    async def create_transformation(self, parent_batch_ids: list, child_batch_id: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("TraceabilityContract", "createTransformation", {"parent_batch_ids": parent_batch_ids, "child_batch_id": child_batch_id}, actor_context)

    async def record_scan(self, reference_id: str, scan_type: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("AuditContract", "recordScan", {"reference_id": reference_id, "scan_type": scan_type}, actor_context)

    async def record_verification(self, inner_credential_hash: str, is_valid: bool, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("AuditContract", "recordVerification", {"inner_credential_hash": inner_credential_hash, "is_valid": is_valid}, actor_context)

    async def block_batch(self, batch_id: str, reason: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("IncidentContract", "blockBatch", {"batch_id": batch_id, "reason": reason}, actor_context)

    async def create_recall_action(self, recall_id: str, affected_scope_ids: list, reason: str, actor_context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.submit_transaction("IncidentContract", "createRecallAction", {"recall_id": recall_id, "affected_scope_ids": affected_scope_ids, "reason": reason}, actor_context)
