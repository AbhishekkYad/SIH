from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import UUID

class BatchCreate(BaseModel):
    batch_id: str = Field(..., min_length=1)
    product_id: UUID
    parent_metadata: Optional[Dict[str, Any]] = None
    quantity: Decimal
    state: str
    owner_org_id: UUID

class BatchOut(BaseModel):
    batch_id: str
    product_id: UUID
    parent_metadata: Optional[Dict[str, Any]]
    quantity: Decimal
    state: str
    owner_org_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
