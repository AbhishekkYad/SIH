from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class LocationData(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, json_schema_extra={"example": 19.2183})
    longitude: float = Field(..., ge=-180, le=180, json_schema_extra={"example": 72.9781})
    location_name: Optional[str] = Field(None, json_schema_extra={"example": "Lokmanya Nagar, Thane, Maharashtra"})

class BatchCreate(BaseModel):
    product_id: str = Field(..., json_schema_extra={"example": "prd-oj-001"})
    quantity: float = Field(..., gt=0, json_schema_extra={"example": 500.0})
    unit_of_measure: str = Field("KG", json_schema_extra={"example": "KG"})
    parent_batch_ids: Optional[List[str]] = Field(default_factory=list, json_schema_extra={"example": []})
    location: Optional[LocationData] = None
    metadata: Optional[Dict[str, Any]] = None

class BatchValidateRequest(BaseModel):
    notes: Optional[str] = Field(None, json_schema_extra={"example": "Quality inspection passed"})
    location: Optional[LocationData] = None
    metadata: Optional[Dict[str, Any]] = None

class CustodyTransferRequest(BaseModel):
    to_org_id: str = Field(..., json_schema_extra={"example": "org-transporter-fastlogistics"})
    notes: Optional[str] = Field(None, json_schema_extra={"example": "Dispatching shipment"})
    location: Optional[LocationData] = None
    metadata: Optional[Dict[str, Any]] = None

class ReceiveBatchRequest(BaseModel):
    location: Optional[LocationData] = None
    metadata: Optional[Dict[str, Any]] = None

class ProcessBatchRequest(BaseModel):
    location: Optional[LocationData] = None
    metadata: Optional[Dict[str, Any]] = None

class BatchResponse(BaseModel):
    batch_id: str
    product_id: str
    producer_org_id: str
    current_custodian_org_id: str
    lifecycle_state: str
    quantity: float
    unit_of_measure: str
    created_at: str
    blockchain_tx_id: Optional[str] = None
