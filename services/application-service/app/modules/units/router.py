from fastapi import APIRouter, Depends, status
from app.auth import get_current_actor, require_roles, ActorContext
from app.schemas.units import UnitCreate, UnitResponse
from app.modules.units.service import UnitService

router = APIRouter(prefix="/units", tags=["Units"])
unit_service = UnitService()


@router.post("", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
async def create_unit(
    payload: UnitCreate,
    actor: ActorContext = Depends(require_roles(["manufacturer", "processor", "admin"]))
):
    """Create individual sellable/traceable physical unit derived from a batch."""
    return await unit_service.create_unit(payload, actor)


@router.get("/{unit_id}", response_model=UnitResponse)
async def get_unit(
    unit_id: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve details of a specific unit by unit ID."""
    return await unit_service.get_unit(unit_id)
