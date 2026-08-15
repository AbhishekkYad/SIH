from pydantic import BaseModel, UUID4, Field
from typing import Optional

class OrganizationCreate(BaseModel):
    org_id: Optional[UUID4] = None
    name: str = Field(..., min_length=2)
    type: str = Field(..., min_length=2)  # e.g., MANUFACTURER, CARRIER
    fabric_msp_id: str = Field(..., min_length=2)

class OrganizationOut(BaseModel):
    org_id: UUID4
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
