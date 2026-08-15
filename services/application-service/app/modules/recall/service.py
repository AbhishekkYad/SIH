from typing import Dict, Any
import uuid
import datetime
from fastapi import HTTPException, status
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.recall import BlockBatchRequest, RecallCreateRequest, RecallActionResponse


class RecallService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    async def block_batch(self, payload: BlockBatchRequest, actor: ActorContext) -> Dict[str, Any]:
        # Step 1: Check batch exists
        batch = await self.data_client.get_batch(payload.batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{payload.batch_id}' not found")
        
        # Step 2: Submit block transaction to Blockchain Service (IncidentContract.blockBatch)
        tx_res = await self.bc_client.block_batch(batch_id=payload.batch_id, reason=payload.reason, actor_context=actor.dict())
        
        # Step 3: Update batch state to BLOCKED in Data Service
        updated_batch = await self.data_client.update_batch_state(batch_id=payload.batch_id, state="BLOCKED")
        
        return {
            "status": "SUCCESS",
            "batch_id": payload.batch_id,
            "new_state": updated_batch["lifecycle_state"],
            "reason": payload.reason,
            "blockchain_tx_id": tx_res.get("tx_id")
        }

    async def create_recall_action(self, payload: RecallCreateRequest, actor: ActorContext) -> RecallActionResponse:
        recall_id = f"rcl-{uuid.uuid4().hex[:8]}"
        
        # Step 1: Submit recall action to Blockchain Service (IncidentContract.createRecallAction)
        tx_res = await self.bc_client.create_recall_action(
            recall_id=recall_id,
            affected_scope_ids=payload.affected_batch_ids,
            reason=payload.reason,
            actor_context=actor.dict()
        )
        
        # Step 2: Update lifecycle state of affected batches to RECALLED
        for batch_id in payload.affected_batch_ids:
            try:
                await self.data_client.update_batch_state(batch_id=batch_id, state="RECALLED")
            except Exception:
                pass
        
        # Step 3: Save Recall Action to Data Service
        recall_record = {
            "recall_id": recall_id,
            "affected_batch_ids": payload.affected_batch_ids,
            "reason": payload.reason,
            "status": "RECALL_ISSUED",
            "blockchain_tx_id": tx_res.get("tx_id")
        }
        saved_recall = await self.data_client.save_recall_action(recall_record)
        
        return RecallActionResponse(
            recall_id=saved_recall["recall_id"],
            affected_batch_ids=saved_recall["affected_batch_ids"],
            reason=saved_recall["reason"],
            status=saved_recall["status"],
            blockchain_tx_id=saved_recall["blockchain_tx_id"],
            created_at=saved_recall["created_at"]
        )
