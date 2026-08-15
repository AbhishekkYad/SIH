import uuid
from sqlalchemy import Column, String, ForeignKey, UUID, DateTime, func

from app.database import Base

class ScanEvent(Base):
    __tablename__ = "scan_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_id = Column(String, nullable=False, index=True)  # can be unit_id or batch_id scanned
    actor_org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="SET NULL"), nullable=True)
    location = Column(String, nullable=True)
    timestamp = Column(DateTime, default=func.now(), server_default=func.now(), nullable=False)
    result = Column(String, nullable=True)  # e.g. VERIFIED_TRACEABLE, SUSPICIOUS, UNVERIFIED

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor = Column(String, nullable=False, index=True)  # e.g., service account or system operator user
    action = Column(String, nullable=False)  # database write or read-model synchronization trigger
    target = Column(String, nullable=False)  # affected table or row reference
    timestamp = Column(DateTime, default=func.now(), server_default=func.now(), nullable=False)
    result = Column(String, nullable=False)  # e.g., SUCCESS, FAILURE
    request_id = Column(String, nullable=True, index=True)
