from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.auth import get_current_actor, ActorContext
from app.modules.lineage.service import LineageService

router = APIRouter(prefix="/lineage", tags=["Lineage"])
lineage_service = LineageService()


@router.get("/{batch_id}/parents", response_model=List[Dict[str, Any]])
async def get_parents(
    batch_id: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve direct parent batches of a given batch."""
    return await lineage_service.get_parents(batch_id)


@router.get("/{batch_id}/children", response_model=List[Dict[str, Any]])
async def get_children(
    batch_id: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve direct child batches derived from a given batch."""
    return await lineage_service.get_children(batch_id)


@router.get("/{batch_id}", response_model=Dict[str, Any])
async def get_full_lineage(
    batch_id: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve complete graph lineage (parents + children) for a batch."""
    return await lineage_service.get_full_lineage(batch_id)
