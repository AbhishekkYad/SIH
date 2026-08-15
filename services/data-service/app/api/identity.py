from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.identity import OrganizationCreate, OrganizationOut, RolePermissionCreate, RolePermissionOut
from app.repositories.identity import IdentityRepository

logger = logging.getLogger("sih.api.identity")
router = APIRouter(prefix="/internal/identity", tags=["identity"], dependencies=[Depends(verify_internal_api_key)])

@router.post("/organizations", response_model=APIResponse[OrganizationOut], status_code=status.HTTP_201_CREATED)
async def create_organization(payload: OrganizationCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new supply chain organization read model.
    """
    # Check duplicate ID
    if payload.org_id:
        existing_id = await IdentityRepository.get_organization_by_id(db, payload.org_id)
        if existing_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Organization with ID {payload.org_id} already exists."
            )

    # Check duplicate Name
    existing_name = await IdentityRepository.get_organization_by_name(db, payload.name)
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization with name '{payload.name}' already exists."
        )

    org = await IdentityRepository.create_organization(
        db=db,
        name=payload.name,
        type=payload.type,
        fabric_msp_id=payload.fabric_msp_id,
        org_id=payload.org_id
    )

    org_out = OrganizationOut.model_validate(org)
    return APIResponse(
        success=True,
        data=org_out,
        message="Organization registered successfully."
    )

@router.post("/roles/permissions", response_model=APIResponse[RolePermissionOut], status_code=status.HTTP_201_CREATED)
async def assign_role_permission(payload: RolePermissionCreate, db: AsyncSession = Depends(get_db)):
    """
    Persists a permission mapping for a specific supply chain role.
    """
    perm = await IdentityRepository.assign_role_permission(
        db=db,
        role_id=payload.role_id,
        permission_code=payload.permission_code
    )
    perm_out = RolePermissionOut.model_validate(perm)
    return APIResponse(
        success=True,
        data=perm_out,
        message="Role permission mapped successfully."
    )
