from pydantic import BaseModel, Field
from typing import List, Optional


class BlockBatchRequest(BaseModel):
    batch_id: str = Field(..., json_schema_extra={"example": "batch-raw-101"})
    reason: str = Field(..., json_schema_extra={"example": "Suspected bacterial contamination reported in consumer feedback"})


class RecallCreateRequest(BaseModel):
    affected_batch_ids: List[str] = Field(..., json_schema_extra={"example": ["batch-raw-101"]})
    reason: str = Field(..., json_schema_extra={"example": "Class I Recall - Severe contamination hazard"})


class RecallActionResponse(BaseModel):
    recall_id: str
    affected_batch_ids: List[str]
    reason: str
    status: str
    blockchain_tx_id: str
    created_at: str
