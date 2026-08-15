from fastapi import APIRouter, Depends
from app.auth import get_current_actor, ActorContext
from app.schemas.qr import QRResolveRequest, CredentialVerifyRequest, QRResolveResponse, CredentialVerifyResponse
from app.modules.qr.service import QRService

router = APIRouter(prefix="/qr", tags=["QR & Authenticity"])
qr_service = QRService()


@router.post("/resolve", response_model=QRResolveResponse)
async def resolve_qr(
    payload: QRResolveRequest,
    actor: ActorContext = Depends(get_current_actor)
):
    """Resolve an outer public QR code reference, record audit scan, and return trace history."""
    return await qr_service.resolve_qr(payload, actor)


@router.post("/verify-credential", response_model=CredentialVerifyResponse)
async def verify_inner_credential(
    payload: CredentialVerifyRequest,
    actor: ActorContext = Depends(get_current_actor)
):
    """Verify an inner concealed authenticity credential without altering product custody."""
    return await qr_service.verify_inner_credential(payload, actor)
