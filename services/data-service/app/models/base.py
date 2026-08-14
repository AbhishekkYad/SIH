from sqlalchemy import Column, DateTime, func

class TimestampMixin:
    created_at = Column(DateTime, default=func.now(), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now(), 
        server_default=func.now(), 
        nullable=False
    )
