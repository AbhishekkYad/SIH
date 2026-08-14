from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.auth import get_current_actor, require_roles, ActorContext
from app.modules.audit.service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit Trail"])
audit_service = AuditService()


@router.get("/trail", response_model=List[Dict[str, Any]])
async def get_audit_trail(
    actor: ActorContext = Depends(require_roles(["regulator", "admin"]))
):
    """Retrieve immutable audit trail log of stakeholder and consumer interactions."""
    return await audit_service.get_audit_trail(actor)
