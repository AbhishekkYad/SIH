from fastapi import APIRouter, Depends
from app.auth import get_current_actor, require_roles, ActorContext
from app.schemas.risk import RiskPropagateRequest, RiskScopeResponse
from app.modules.risk.service import RiskService

router = APIRouter(prefix="/risk", tags=["Risk Propagator"])
risk_service = RiskService()


@router.post("/propagate", response_model=RiskScopeResponse)
async def propagate_risk(
    payload: RiskPropagateRequest,
    actor: ActorContext = Depends(require_roles(["manufacturer", "regulator", "admin"]))
):
    """Run bidirectional Risk Propagator logic over lineage graph to calculate affected scopes."""
    return await risk_service.propagate_risk(payload, actor)
