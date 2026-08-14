from pydantic import BaseModel
from typing import List, Optional

class LineageEdgeOut(BaseModel):
    parent_id: str
    child_id: str
    relation_type: str
    quantity: Optional[float] = None

class LineageOut(BaseModel):
    entity_id: str
    upstream: List[str]
    downstream: List[str]
    edges: List[LineageEdgeOut]
