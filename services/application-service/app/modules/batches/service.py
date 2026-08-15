from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import uuid
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.batches import BatchCreate, BatchValidateRequest, CustodyTransferRequest, BatchResponse


class BatchService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    async def create_batch(self, payload: BatchCreate, actor: ActorContext) -> BatchResponse:
        # Step 1: Verify product exists
        product = await self.data_client.get_product(payload.product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product '{payload.product_id}' not found")
        
        batch_id = f"batch-{uuid.uuid4().hex[:8]}"
        
        # Step 2: Submit to Blockchain Service (TraceabilityContract.registerBatch)
        tx_result = await self.bc_client.register_batch(
            batch_id=batch_id,
            product_id=payload.product_id,
            quantity=payload.quantity,
            unit_of_measure=payload.unit_of_measure,
            actor_context=actor.dict()
        )
        
        # Step 3: Record Parent Lineage Relationships if transforming/deriving
        if payload.parent_batch_ids:
            for p_id in payload.parent_batch_ids:
                await self.data_client.save_lineage_edge(parent_batch_id=p_id, child_batch_id=batch_id)
            # Submit transformation event to Fabric Gateway
            await self.bc_client.create_transformation(
                parent_batch_ids=payload.parent_batch_ids,
                child_batch_id=batch_id,
                actor_context=actor.dict()
            )
        
        # Step 4: Write to Data Service Read Model upon commit
        batch_data = {
            "batch_id": batch_id,
            "product_id": payload.product_id,
            "producer_org_id": actor.org_id,
            "current_custodian_org_id": actor.org_id,
            "lifecycle_state": "REGISTERED",
            "quantity": payload.quantity,
            "unit_of_measure": payload.unit_of_measure,
            "blockchain_tx_id": tx_result.get("tx_id")
        }
        saved_batch = await self.data_client.save_batch(batch_data)
        
        return BatchResponse(
            batch_id=saved_batch["batch_id"],
            product_id=saved_batch["product_id"],
            producer_org_id=saved_batch["producer_org_id"],
            current_custodian_org_id=saved_batch["current_custodian_org_id"],
            lifecycle_state=saved_batch["lifecycle_state"],
            quantity=saved_batch["quantity"],
            unit_of_measure=saved_batch["unit_of_measure"],
            created_at=saved_batch["created_at"],
            blockchain_tx_id=saved_batch.get("blockchain_tx_id")
        )

    async def validate_batch(self, batch_id: str, payload: BatchValidateRequest, actor: ActorContext) -> BatchResponse:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        
        # Submit validate transaction to Blockchain Service
        tx_result = await self.bc_client.validate_batch(batch_id=batch_id, actor_context=actor.dict())
        
        # Update state in Data Service
        updated_batch = await self.data_client.update_batch_state(batch_id=batch_id, state="VALIDATED")
        updated_batch["blockchain_tx_id"] = tx_result.get("tx_id")
        
        return BatchResponse(
            batch_id=updated_batch["batch_id"],
            product_id=updated_batch["product_id"],
            producer_org_id=updated_batch["producer_org_id"],
            current_custodian_org_id=updated_batch["current_custodian_org_id"],
            lifecycle_state=updated_batch["lifecycle_state"],
            quantity=updated_batch["quantity"],
            unit_of_measure=updated_batch["unit_of_measure"],
            created_at=updated_batch["created_at"],
            blockchain_tx_id=updated_batch.get("blockchain_tx_id")
        )

    async def transfer_custody(self, batch_id: str, payload: CustodyTransferRequest, actor: ActorContext) -> BatchResponse:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        
        # Submit custody transfer to Blockchain Service
        tx_result = await self.bc_client.transfer_batch(batch_id=batch_id, to_org_id=payload.to_org_id, actor_context=actor.dict())
        
        # Update Data Service read model
        updated_batch = await self.data_client.update_batch_state(
            batch_id=batch_id,
            state="IN_TRANSIT",
            custodian_org_id=payload.to_org_id
        )
        updated_batch["blockchain_tx_id"] = tx_result.get("tx_id")
        
        return BatchResponse(
            batch_id=updated_batch["batch_id"],
            product_id=updated_batch["product_id"],
            producer_org_id=updated_batch["producer_org_id"],
            current_custodian_org_id=updated_batch["current_custodian_org_id"],
            lifecycle_state=updated_batch["lifecycle_state"],
            quantity=updated_batch["quantity"],
            unit_of_measure=updated_batch["unit_of_measure"],
            created_at=updated_batch["created_at"],
            blockchain_tx_id=updated_batch.get("blockchain_tx_id")
        )

    async def get_batch(self, batch_id: str) -> BatchResponse:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        
        return BatchResponse(
            batch_id=batch["batch_id"],
            product_id=batch["product_id"],
            producer_org_id=batch["producer_org_id"],
            current_custodian_org_id=batch["current_custodian_org_id"],
            lifecycle_state=batch["lifecycle_state"],
            quantity=batch["quantity"],
            unit_of_measure=batch["unit_of_measure"],
            created_at=batch["created_at"],
            blockchain_tx_id=batch.get("blockchain_tx_id")
        )
