from pydantic import BaseModel, UUID4, Field
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

class BatchCreate(BaseModel):
    batch_id: str = Field(..., min_length=1)
    product_id: UUID4
    parent_metadata: Optional[Dict[str, Any]] = None
    quantity: Decimal
    state: str
    owner_org_id: UUID4

class BatchOut(BaseModel):
    batch_id: str
    product_id: UUID4
    parent_metadata: Optional[Dict[str, Any]]
    quantity: Decimal
    state: str
    owner_org_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
