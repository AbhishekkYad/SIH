import uuid
from sqlalchemy import Column, String, ForeignKey, UUID, DateTime, func

from app.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    evidence_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cid = Column(String, unique=True, nullable=False, index=True)  # IPFS content identifier
    content_hash = Column(String, nullable=False)  # file cryptographic SHA-256 checksum
    type = Column(String, nullable=False)  # CERTIFICATE, LAB_REPORT, INCIDENT_PHOTO
    access_class = Column(String, default="RESTRICTED", nullable=False)  # PUBLIC, RESTRICTED
    linked_entity_type = Column(String, nullable=True)  # e.g., BATCH, INCIDENT, FEEDBACK
    linked_entity_id = Column(String, nullable=True, index=True)  # maps to the target batch_id, incident_id, etc.
    owner_org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=func.now(), server_default=func.now(), nullable=False)
