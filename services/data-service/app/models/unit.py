from sqlalchemy import Column, String, ForeignKey, UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin

class Unit(Base, TimestampMixin):
    __tablename__ = "units"

    unit_id = Column(String, primary_key=True)
    batch_id = Column(String, ForeignKey("batches.batch_id", ondelete="CASCADE"), nullable=False)
    serial_reference = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)  # Lifecycle State Machine
    qr_credential_id = Column(UUID(as_uuid=True), ForeignKey("qr_credentials.qr_credential_id", ondelete="SET NULL"), nullable=True)

    batch = relationship("Batch", back_populates="units")
    qr_credential = relationship("QrCredential", foreign_keys=[qr_credential_id], post_update=True)
