from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat().replace("+00:00", "") + "Z"
        }
