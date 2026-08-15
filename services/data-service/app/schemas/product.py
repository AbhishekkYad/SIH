from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    product_id: UUID4
    name: str
    product_type: str
    category: Optional[str] = None

class ProductOut(BaseModel):
    product_id: UUID4
    name: str
    product_type: str
    category: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
