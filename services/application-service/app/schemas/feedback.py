from pydantic import BaseModel, Field
from typing import Optional, List


class FeedbackSubmitRequest(BaseModel):
    batch_or_unit_id: str = Field(..., json_schema_extra={"example": "batch-raw-101"})
    category: str = Field(..., json_schema_extra={"example": "OFF_FLAVOR_SPOILAGE"})
    description: str = Field(..., json_schema_extra={"example": "Product tastes sour and package is swollen"})
    evidence_filename: Optional[str] = Field(None, json_schema_extra={"example": "photo_evidence.jpg"})
    evidence_base64: Optional[str] = Field(None, description="Optional raw evidence payload to pin to IPFS")


class IncidentResponse(BaseModel):
    incident_id: str
    batch_or_unit_id: str
    category: str
    description: str
    nearest_accountable_org_id: str
    evidence_cid: Optional[str] = None
    status: str
    escalation_level: str
    created_at: str
