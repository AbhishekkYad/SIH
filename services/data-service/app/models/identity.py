import uuid
from sqlalchemy import Column, String, ForeignKey, UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin

class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    org_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False, index=True)
    type = Column(String, nullable=False)  # e.g., FARMER, PRODUCER, MANUFACTURER, TRANSPORTER, RETAILER, REGULATOR, ADMIN
    fabric_msp_id = Column(String, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")

class User(Base, TimestampMixin):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id", ondelete="CASCADE"), nullable=False)
    role_id = Column(String, nullable=False)
    auth_subject = Column(String, unique=True, nullable=False, index=True)  # unique ID from authentication provider
    status = Column(String, default="ACTIVE", nullable=False)

    organization = relationship("Organization", back_populates="users")

class RolePermission(Base):
    __tablename__ = "roles_permissions"

    role_id = Column(String, primary_key=True)
    permission_code = Column(String, primary_key=True)
