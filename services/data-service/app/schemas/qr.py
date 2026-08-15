from pydantic import BaseModel, UUID4, Field
from typing import Optional, Dict, Any
from datetime import datetime

from app.schemas.unit import UnitOut
from app.schemas.batch import BatchOut
from app.schemas.product import ProductOut

class QrCreate(BaseModel):
    public_reference: str = Field(..., min_length=1)
    credential_hash: str = Field(..., min_length=1)
    unit_id: Optional[str] = None
    credential_status: Optional[str] = "ACTIVE"
    binding_metadata: Optional[Dict[str, Any]] = None

class QrOut(BaseModel):
    qr_credential_id: UUID4
    unit_id: Optional[str]
    public_reference: str
    credential_hash: str
    credential_status: str
    binding_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QrResolveOut(BaseModel):
    credential: QrOut
    unit: Optional[UnitOut] = None
    batch: Optional[BatchOut] = None
    product: Optional[ProductOut] = None
