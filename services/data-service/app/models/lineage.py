from sqlalchemy import Column, String, ForeignKey, Numeric, UUID

from app.database import Base

class LineageEdge(Base):
    __tablename__ = "lineage_edges"

    parent_batch_id = Column(String, ForeignKey("batches.batch_id", ondelete="CASCADE"), primary_key=True)
    child_batch_id = Column(String, ForeignKey("batches.batch_id", ondelete="CASCADE"), primary_key=True)
    relation_type = Column(String, default="TRANSFORMATION", nullable=False)  # TRANSFORMATION, MIXING, SPLIT
    quantity = Column(Numeric(precision=12, scale=2), nullable=True)  # quantity contributed by this parent
    created_event_id = Column(UUID(as_uuid=True), ForeignKey("events.event_id", ondelete="SET NULL"), nullable=True)
