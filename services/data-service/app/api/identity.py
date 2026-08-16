from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import uuid

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.identity import OrganizationCreate, OrganizationOut, RolePermissionCreate, RolePermissionOut, UserCreate, UserOut
from app.repositories.identity import IdentityRepository

logger = logging.getLogger("sih.api.identity")
router = APIRouter(prefix="/internal/identity", tags=["identity"], dependencies=[Depends(verify_internal_api_key)])

@router.get("/organizations/{org_id}", response_model=APIResponse[OrganizationOut])
async def get_organization(org_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Retrieves an organization read model by its ID.
    Used to resolve authoritative fabric_msp_id for blockchain transactions.
    """
    org = await IdentityRepository.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {org_id} not found."
        )
    
    org_out = OrganizationOut.model_validate(org)
    return APIResponse(
        success=True,
        data=org_out,
        message="Organization retrieved successfully."
    )

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

@router.post("/users", response_model=APIResponse[UserOut], status_code=status.HTTP_201_CREATED)
async def assign_user_role(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Creates a User read model mapping a user subject to a role and organization.
    """
    # Verify organization exists (Foreign Key check)
    org = await IdentityRepository.get_organization_by_id(db, payload.organization_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization with ID {payload.organization_id} does not exist."
        )

    # Check duplicate ID if specified
    if payload.user_id:
        existing_id = await IdentityRepository.get_user_by_id(db, payload.user_id)
        if existing_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with ID {payload.user_id} already exists."
            )

    user = await IdentityRepository.create_or_update_user(
        db=db,
        organization_id=payload.organization_id,
        role_id=payload.role_id,
        auth_subject=payload.auth_subject,
        user_id=payload.user_id
    )

    user_out = UserOut.model_validate(user)
    return APIResponse(
        success=True,
        data=user_out,
        message="User role assigned successfully."
    )
