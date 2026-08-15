from fastapi import APIRouter, Depends, status
from typing import Dict, Any
from app.auth import require_roles, ActorContext
from app.schemas.recall import BlockBatchRequest, RecallCreateRequest, RecallActionResponse
from app.modules.recall.service import RecallService

router = APIRouter(prefix="/recall", tags=["Recall & Corrective Action"])
recall_service = RecallService()


@router.post("/block", response_model=Dict[str, Any])
async def block_batch(
    payload: BlockBatchRequest,
    actor: ActorContext = Depends(require_roles(["manufacturer", "regulator", "admin"]))
):
    """Block a batch from downstream distribution or processing."""
    return await recall_service.block_batch(payload, actor)


@router.post("/recalls", response_model=RecallActionResponse, status_code=status.HTTP_201_CREATED)
async def create_recall_action(
    payload: RecallCreateRequest,
    actor: ActorContext = Depends(require_roles(["manufacturer", "regulator", "admin"]))
):
    """Issue an official targeted recall action across calculated affected batch scopes."""
    return await recall_service.create_recall_action(payload, actor)
