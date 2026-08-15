import uuid
from sqlalchemy import Column, String, ForeignKey, UUID, JSON
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin

class QrCredential(Base, TimestampMixin):
    __tablename__ = "qr_credentials"

    qr_credential_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(String, ForeignKey("units.unit_id", ondelete="CASCADE"), nullable=True)
    public_reference = Column(String, unique=True, nullable=False, index=True)
    credential_hash = Column(String, nullable=False)  # stored hash (e.g. SHA-256) of concealed credential
    credential_status = Column(String, default="ACTIVE", nullable=False)  # ACTIVE, SUSPENDED, REVOKED, UNVERIFIED
    binding_metadata = Column(JSON, nullable=True)  # validation properties
