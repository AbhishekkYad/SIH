from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, UUID4
from typing import List, Optional
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.repositories.risk_recall import RiskRecallRepository

logger = logging.getLogger("sih.api.risk_recall")
router = APIRouter(prefix="/internal/risk-recall", tags=["risk-recall"], dependencies=[Depends(verify_internal_api_key)])

class RiskScopeNodeItem(BaseModel):
    entity_type: str  # BATCH, UNIT
    entity_id: str
    impact_status: Optional[str] = "POTENTIAL"

class RiskScopeCreate(BaseModel):
    incident_id: UUID4
    scope_status: Optional[str] = "POTENTIAL"
    nodes: List[RiskScopeNodeItem]

class RecallActionCreate(BaseModel):
    incident_id: UUID4
    scope_id: UUID4
    action_type: str  # BLOCK, RECALL
    authorized_by: UUID4

class RecallStatusUpdate(BaseModel):
    status: str  # IN_PROGRESS, COMPLETED, CANCELLED

@router.post("/scopes", status_code=status.HTTP_201_CREATED)
async def create_risk_scope(payload: RiskScopeCreate, db: AsyncSession = Depends(get_db)):
    """
    Saves a snapshot list of computed risk propagation scopes and nodes.
    """
    try:
        scope = await RiskRecallRepository.create_risk_scope(
            db=db,
            incident_id=payload.incident_id,
            scope_status=payload.scope_status
        )

        nodes_data = [node.model_dump() for node in payload.nodes]
        nodes = await RiskRecallRepository.add_scope_nodes(
            db=db,
            scope_id=scope.scope_id,
            nodes=nodes_data
        )

        return APIResponse(
            success=True,
            data={
                "scope_id": scope.scope_id,
                "incident_id": scope.incident_id,
                "scope_status": scope.scope_status,
                "nodes_count": len(nodes)
            },
            message="Risk scope snapshots persisted successfully."
        )
    except Exception as e:
        logger.error(f"Failed to create risk scope: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save risk scope snapshot: {e}"
        )

@router.post("/recalls", status_code=status.HTTP_201_CREATED)
async def create_recall(payload: RecallActionCreate, db: AsyncSession = Depends(get_db)):
    """
    Persists a new recall/blocking action.
    """
    try:
        recall = await RiskRecallRepository.create_recall_action(
            db=db,
            incident_id=payload.incident_id,
            scope_id=payload.scope_id,
            action_type=payload.action_type,
            authorized_by=payload.authorized_by
        )
        return APIResponse(
            success=True,
            data={
                "recall_action_id": recall.recall_action_id,
                "action_type": recall.action_type,
                "status": recall.status
            },
            message="Recall action persisted successfully."
        )
    except Exception as e:
        logger.error(f"Failed to record recall action: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save recall action: {e}"
        )

@router.post("/recalls/{recall_action_id}/status")
async def update_recall_status(recall_action_id: UUID4, payload: RecallStatusUpdate, db: AsyncSession = Depends(get_db)):
    """
    Updates the status lifecycle of an active recall action.
    """
    recall = await RiskRecallRepository.update_recall_status(db, recall_action_id, payload.status)
    if not recall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recall action with ID {recall_action_id} not found."
        )
    return APIResponse(
        success=True,
        data={
            "recall_action_id": recall.recall_action_id,
            "status": recall.status
        },
        message="Recall action status updated successfully."
    )
