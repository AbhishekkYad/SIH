from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class ProductCreate(BaseModel):
    product_id: UUID
    name: str
    product_type: str
    category: Optional[str] = None

class ProductOut(BaseModel):
    product_id: UUID
    name: str
    product_type: str
    category: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
