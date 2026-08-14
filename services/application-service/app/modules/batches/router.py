from fastapi import APIRouter, Depends, status
from app.auth import get_current_actor, require_roles, ActorContext
from app.schemas.batches import BatchCreate, BatchValidateRequest, CustodyTransferRequest, BatchResponse
from app.modules.batches.service import BatchService

router = APIRouter(prefix="/batches", tags=["Batches"])
batch_service = BatchService()


@router.post("", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    payload: BatchCreate,
    actor: ActorContext = Depends(require_roles(["farmer", "supplier", "producer", "processor", "manufacturer", "admin"]))
):
    """Create and register a new traceable product batch."""
    return await batch_service.create_batch(payload, actor)


@router.post("/{batch_id}/validate", response_model=BatchResponse)
async def validate_batch(
    batch_id: str,
    payload: BatchValidateRequest,
    actor: ActorContext = Depends(require_roles(["producer", "processor", "manufacturer", "admin"]))
):
    """Validate a batch state through the authorized validation workflow (P0 Milestone)."""
    return await batch_service.validate_batch(batch_id, payload, actor)


@router.post("/{batch_id}/transfer", response_model=BatchResponse)
async def transfer_custody(
    batch_id: str,
    payload: CustodyTransferRequest,
    actor: ActorContext = Depends(require_roles(["farmer", "producer", "processor", "manufacturer", "transporter", "admin"]))
):
    """Transfer batch custody to another supply-chain organization."""
    return await batch_service.transfer_custody(batch_id, payload, actor)


@router.get("/{batch_id}", response_model=BatchResponse)
async def get_batch(
    batch_id: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve batch details and current lifecycle state."""
    return await batch_service.get_batch(batch_id)
