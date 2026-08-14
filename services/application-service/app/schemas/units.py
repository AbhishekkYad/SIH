from pydantic import BaseModel, Field
from typing import Optional


class UnitCreate(BaseModel):
    batch_id: str = Field(..., json_schema_extra={"example": "batch-raw-101"})
    serial_number: Optional[str] = Field(None, json_schema_extra={"example": "SN-9988112233"})


class UnitResponse(BaseModel):
    unit_id: str
    batch_id: str
    serial_number: str
    status: str
    created_at: str
    blockchain_tx_id: Optional[str] = None
