from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import uuid
import json
from datetime import datetime
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.batches import BatchCreate, BatchValidateRequest, CustodyTransferRequest, BatchResponse


class BatchService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    def _build_metadata_json(self, payload) -> str:
        meta = {}
        if getattr(payload, "location", None):
            meta.update(payload.location.model_dump())
        if getattr(payload, "metadata", None):
            meta.update(payload.metadata)
        return json.dumps(meta) if meta else ""

    async def create_batch(self, payload: BatchCreate, actor: ActorContext) -> BatchResponse:
        # Step 1: Verify product exists
        product = await self.data_client.get_product(payload.product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product '{payload.product_id}' not found")
        
        batch_id = f"batch-{uuid.uuid4().hex[:8]}"
        
        # Step 2: Submit to Blockchain Service (TraceabilityContract.registerBatch)
        metadataJson = self._build_metadata_json(payload)
        tx_result = await self.bc_client.register_batch(
            batch_id=batch_id,
            product_id=payload.product_id,
            quantity=payload.quantity,
            unit_of_measure=payload.unit_of_measure,
            actor_context=actor.dict(),
            metadataJson=metadataJson
        )
        
        # Step 3: Record Parent Lineage Relationships if transforming/deriving
        if payload.parent_batch_ids:
            # We don't save lineage edge to D1 directly anymore, it will be done via webhook/transformation event
            # Submit transformation event to Fabric Gateway
            await self.bc_client.create_transformation(
                parent_batch_ids=payload.parent_batch_ids,
                child_batch_id=batch_id,
                actor_context=actor.dict(),
                metadataJson=metadataJson
            )
        
        # Step 4: D1 persistence
        # We must save to D1 synchronously because the webhook only saves the event
        batch_data = {
            "batch_id": batch_id,
            "product_id": payload.product_id,
            "owner_org_id": actor.org_id,
            "state": "REGISTERED",
            "quantity": payload.quantity,
            "parent_metadata": {"parent_batch_ids": payload.parent_batch_ids} if payload.parent_batch_ids else None
        }
        await self.data_client.save_batch(batch_data)
        return BatchResponse(
            batch_id=batch_id,
            product_id=payload.product_id,
            producer_org_id=actor.org_id,
            current_custodian_org_id=actor.org_id,
            lifecycle_state="REGISTERED",
            quantity=payload.quantity,
            unit_of_measure=payload.unit_of_measure,
            created_at=datetime.utcnow().isoformat(),
            blockchain_tx_id=tx_result.get("transaction_id")
        )

    async def validate_batch(self, batch_id: str, payload: BatchValidateRequest, actor: ActorContext) -> BatchResponse:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        
        metadataJson = self._build_metadata_json(payload)
        tx_result = await self.bc_client.validate_batch(batch_id=batch_id, actor_context=actor.dict(), metadataJson=metadataJson)
        
        # Persistence will happen asynchronously via webhook
        return BatchResponse(
            batch_id=batch["batch_id"],
            product_id=str(batch["product_id"]),
            producer_org_id=str(batch.get("owner_org_id", "")),
            current_custodian_org_id=str(batch.get("owner_org_id", "")),
            lifecycle_state="VALIDATED",
            quantity=float(batch["quantity"]),
            unit_of_measure="KG", # D1 doesn't store this, so we mock it
            created_at=batch["created_at"],
            blockchain_tx_id=tx_result.get("transaction_id")
        )

    async def transfer_custody(self, batch_id: str, payload: CustodyTransferRequest, actor: ActorContext) -> BatchResponse:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        
        metadataJson = self._build_metadata_json(payload)
        tx_result = await self.bc_client.transfer_batch(batch_id=batch_id, to_org_id=payload.to_org_id, actor_context=actor.dict(), metadataJson=metadataJson)
        
        # Persistence will happen asynchronously via webhook
        return BatchResponse(
            batch_id=batch["batch_id"],
            product_id=str(batch["product_id"]),
            producer_org_id=str(batch.get("owner_org_id", "")),
            current_custodian_org_id=payload.to_org_id,
            lifecycle_state="IN_TRANSIT",
            quantity=float(batch["quantity"]),
            unit_of_measure="KG",
            created_at=batch["created_at"],
            blockchain_tx_id=tx_result.get("transaction_id")
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
