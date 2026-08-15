import uuid
from sqlalchemy import Column, String, UUID
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    product_type = Column(String, nullable=False)  # e.g., DAIRY, MEAT, GRAIN
    category = Column(String, nullable=True)

    batches = relationship("Batch", back_populates="product", cascade="all, delete-orphan")
