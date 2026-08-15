from pydantic import BaseModel, UUID4
from typing import Optional

class FeedbackCreate(BaseModel):
    unit_id: Optional[str] = None
    batch_id: Optional[str] = None
    category: str
    description: str
    evidence_ref: Optional[str] = None  # IPFS CID reference
    location_granularity: Optional[str] = None  # e.g. City or State

class IncidentCreate(BaseModel):
    unit_id: Optional[str] = None
    batch_id: Optional[str] = None
    category: str
    severity: str
    source: str
