import uuid
from sqlalchemy import Column, String, ForeignKey, UUID, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base

class RiskScope(Base):
    __tablename__ = "risk_scopes"

    scope_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.incident_id", ondelete="CASCADE"), nullable=False)
    scope_status = Column(String, default="POTENTIAL", nullable=False)  # POTENTIAL, REVIEWED, CONFIRMED
    generated_at = Column(DateTime, default=func.now(), server_default=func.now(), nullable=False)

    nodes = relationship("RiskScopeNode", back_populates="scope", cascade="all, delete-orphan")

class RiskScopeNode(Base):
    __tablename__ = "risk_scope_nodes"

    scope_id = Column(UUID(as_uuid=True), ForeignKey("risk_scopes.scope_id", ondelete="CASCADE"), primary_key=True)
    entity_type = Column(String, primary_key=True)  # BATCH, UNIT
    entity_id = Column(String, primary_key=True)  # maps to batch_id or unit_id
    impact_status = Column(String, default="POTENTIAL", nullable=False)  # POTENTIAL, REVIEWED, CONFIRMED

    scope = relationship("RiskScope", back_populates="nodes")

class RecallAction(Base):
    __tablename__ = "recall_actions"

    recall_action_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.incident_id", ondelete="RESTRICT"), nullable=False)
    scope_id = Column(UUID(as_uuid=True), ForeignKey("risk_scopes.scope_id", ondelete="RESTRICT"), nullable=False)
    action_type = Column(String, nullable=False)  # e.g., BLOCK, RECALL
    status = Column(String, default="INITIATED", nullable=False)  # INITIATED, IN_PROGRESS, COMPLETED, CANCELLED
    authorized_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=func.now(), server_default=func.now(), nullable=False)
