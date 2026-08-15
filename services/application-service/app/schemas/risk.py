from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class RiskPropagateRequest(BaseModel):
    source_batch_id: str = Field(..., json_schema_extra={"example": "batch-raw-101"})
    direction: str = Field("BOTH", json_schema_extra={"example": "BOTH"}, description="UPSTREAM, DOWNSTREAM, or BOTH")


class RiskScopeResponse(BaseModel):
    source_batch_id: str
    direction: str
    affected_parent_batches: List[Dict[str, Any]]
    affected_child_batches: List[Dict[str, Any]]
    affected_organizations: List[str]
    risk_level: str
    computed_at: str
