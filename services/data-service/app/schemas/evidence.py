from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime

class EvidenceCreate(BaseModel):
    cid: str
    content_hash: str
    type: str  # CERTIFICATE, LAB_REPORT, etc.
    owner_org_id: UUID4
    access_class: Optional[str] = "RESTRICTED"  # PUBLIC, RESTRICTED
    linked_entity_type: Optional[str] = None
    linked_entity_id: Optional[str] = None

class EvidenceOut(BaseModel):
    evidence_id: UUID4
    cid: str
    content_hash: str
    type: str
    access_class: str
    linked_entity_type: Optional[str]
    linked_entity_id: Optional[str]
    owner_org_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True
