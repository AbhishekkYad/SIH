import uuid
from sqlalchemy import Column, String, ForeignKey, UUID, Integer, Numeric, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin

class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    incident_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(String, ForeignKey("units.unit_id", ondelete="SET NULL"), nullable=True)
    batch_id = Column(String, ForeignKey("batches.batch_id", ondelete="SET NULL"), nullable=True)
    category = Column(String, nullable=False)  # e.g., contamination, packaging, authenticity
    severity = Column(String, nullable=False)  # e.g., Low, Medium, High, Critical
    status = Column(String, default="SUBMITTED", nullable=False, index=True)  # SUBMITTED, UNDER_REVIEW, ESCALATED, RESOLVED, CLOSED
    source = Column(String, nullable=False)  # e.g., CONSUMER, RETAILER, REGULATOR
    
    feedbacks = relationship("Feedback", back_populates="incident")
    accountability_records = relationship("AccountabilityRecord", back_populates="incident", cascade="all, delete-orphan")

class Feedback(Base, TimestampMixin):
    __tablename__ = "feedback"

    feedback_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.incident_id", ondelete="SET NULL"), nullable=True)
    unit_id = Column(String, ForeignKey("units.unit_id", ondelete="SET NULL"), nullable=True)
    batch_id = Column(String, ForeignKey("batches.batch_id", ondelete="SET NULL"), nullable=True)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    evidence_ref = Column(String, nullable=True)  # IPFS CID reference
    location_granularity = Column(String, nullable=True)  # e.g. City or State
    verification_status = Column(String, default="UNVERIFIED", nullable=False)  # UNVERIFIED, REVIEWING, VERIFIED, REJECTED

    incident = relationship("Incident", back_populates="feedbacks")

class AccountabilityRecord(Base, TimestampMixin):
    __tablename__ = "accountability_records"

    record_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.incident_id", ondelete="CASCADE"), nullable=False)
    stakeholder_org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="RESTRICT"), nullable=False)
    level = Column(Integer, nullable=False)  # e.g., 1, 2, 3, 4
    signal_value = Column(Numeric(precision=5, scale=2), nullable=False)  # complaint weight/score contribution
    reason = Column(String, nullable=True)

    incident = relationship("Incident", back_populates="accountability_records")
