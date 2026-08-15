from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class ProductCreate(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Fresh Premium Orange Juice"})
    sku: str = Field(..., json_schema_extra={"example": "SKU-ORJ-500ML"})
    category: str = Field("BEVERAGE", json_schema_extra={"example": "BEVERAGE"})
    specifications: Optional[Dict[str, Any]] = Field(default_factory=dict, json_schema_extra={"example": {"volume": "500ml", "origin": "California"}})


class ProductResponse(BaseModel):
    product_id: str
    name: str
    sku: str
    category: str
    producer_org_id: str
    created_at: str
    blockchain_tx_id: Optional[str] = None
