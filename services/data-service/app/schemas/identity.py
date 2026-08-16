from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class OrganizationCreate(BaseModel):
    org_id: Optional[UUID] = None
    name: str = Field(..., min_length=2)
    type: str = Field(..., min_length=2)  # e.g., MANUFACTURER, CARRIER
    fabric_msp_id: str = Field(..., min_length=2)

class OrganizationOut(BaseModel):
    org_id: UUID
    name: str
    type: str
    fabric_msp_id: str
    status: str

    class Config:
        from_attributes = True

class RolePermissionCreate(BaseModel):
    role_id: str = Field(..., min_length=2)
    permission_code: str = Field(..., min_length=2)

class RolePermissionOut(BaseModel):
    role_id: str
    permission_code: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    user_id: Optional[UUID] = None
    organization_id: UUID
    role_id: str = Field(..., min_length=2)
    auth_subject: str = Field(..., min_length=2)

class UserOut(BaseModel):
    user_id: UUID
    organization_id: UUID
    role_id: str
    auth_subject: str
    status: str

    class Config:
        from_attributes = True
