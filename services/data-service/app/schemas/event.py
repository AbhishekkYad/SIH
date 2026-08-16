from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class EventCreate(BaseModel):
    type: str
    actor_org_id: UUID
    actor_user_id: UUID
    target_id: str
    state_before: Optional[str] = None
    state_after: Optional[str] = None
    fabric_tx_id: str
    timestamp: Optional[datetime] = None

class CustodyEventCreate(BaseModel):
    batch_id: Optional[str] = None
    unit_id: Optional[str] = None
    from_org_id: Optional[UUID] = None
    to_org_id: Optional[UUID] = None
    event_type: str  # TRANSFER, RECEIVE
    timestamp: datetime
    fabric_tx_id: str

class ScanEventCreate(BaseModel):
    entity_id: str
    actor_org_id: Optional[UUID] = None
    location: Optional[str] = None
    result: Optional[str] = None

class EventOut(BaseModel):
    event_id: UUID
    type: str
    actor_org_id: UUID
    actor_user_id: UUID
    target_id: str
    state_before: Optional[str] = None
    state_after: Optional[str] = None
    fabric_tx_id: str
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True
