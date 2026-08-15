from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime

class EventCreate(BaseModel):
    type: str
    actor_org_id: UUID4
    actor_user_id: UUID4
    target_id: str
    state_before: Optional[str] = None
    state_after: Optional[str] = None
    fabric_tx_id: str
    timestamp: Optional[datetime] = None

class CustodyEventCreate(BaseModel):
    batch_id: Optional[str] = None
    unit_id: Optional[str] = None
    from_org_id: Optional[UUID4] = None
    to_org_id: Optional[UUID4] = None
    event_type: str  # TRANSFER, RECEIVE
    timestamp: datetime
    fabric_tx_id: str

class ScanEventCreate(BaseModel):
    entity_id: str
    actor_org_id: Optional[UUID4] = None
    location: Optional[str] = None
    result: Optional[str] = None

class EventOut(BaseModel):
    event_id: UUID4
    type: str
    actor_org_id: UUID4
    actor_user_id: UUID4
    target_id: str
    state_before: Optional[str] = None
    state_after: Optional[str] = None
    fabric_tx_id: str
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True
