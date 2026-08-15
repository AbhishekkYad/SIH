from sqlalchemy import Column, String, ForeignKey, Numeric, UUID, JSON
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin

class Batch(Base, TimestampMixin):
    __tablename__ = "batches"

    # Batch ID is a domain string (e.g., 'B001')
    batch_id = Column(String, primary_key=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="RESTRICT"), nullable=False)
    parent_metadata = Column(JSON, nullable=True)  # captures upstream reference info
    quantity = Column(Numeric(precision=12, scale=2), nullable=False)
    state = Column(String, nullable=False, index=True)  # Lifecycle State Machine
    owner_org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="RESTRICT"), nullable=False)

    product = relationship("Product", back_populates="batches")
    units = relationship("Unit", back_populates="batch", cascade="all, delete-orphan")
