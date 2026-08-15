from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.auth import get_current_actor, require_roles, ActorContext
from app.modules.dashboard.service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboards"])
dashboard_service = DashboardService()


@router.get("/supply-chain-overview", response_model=Dict[str, Any])
async def get_supply_chain_overview(
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve high-level supply chain status metrics across processing, transport, and retail."""
    return await dashboard_service.get_supply_chain_overview(actor)


@router.get("/batches", response_model=List[Dict[str, Any]])
async def get_batch_dashboard(
    actor: ActorContext = Depends(require_roles(["producer", "processor", "manufacturer", "transporter", "retailer", "regulator", "admin"]))
):
    """Retrieve operational batch tracking dashboard view."""
    return await dashboard_service.get_batch_dashboard(actor)


@router.get("/incidents", response_model=List[Dict[str, Any]])
async def get_incident_dashboard(
    actor: ActorContext = Depends(require_roles(["manufacturer", "regulator", "admin"]))
):
    """Retrieve incident investigation and escalation dashboard view."""
    return await dashboard_service.get_incident_dashboard(actor)
