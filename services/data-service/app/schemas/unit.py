from pydantic import BaseModel, UUID4, Field
from typing import Optional
from datetime import datetime

class UnitCreate(BaseModel):
    unit_id: str = Field(..., min_length=1)
    batch_id: str = Field(..., min_length=1)
    serial_reference: str = Field(..., min_length=1)
    state: str
    qr_credential_id: Optional[UUID4] = None

class UnitOut(BaseModel):
    unit_id: str
    batch_id: str
    serial_reference: str
    state: str
    qr_credential_id: Optional[UUID4]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
