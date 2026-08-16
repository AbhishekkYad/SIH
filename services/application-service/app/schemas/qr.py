from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class QRResolveRequest(BaseModel):
    qr_reference: str = Field(..., json_schema_extra={"example": "batch-raw-101"})
    session_ref: Optional[str] = Field(None, json_schema_extra={"example": "anon-session-9912a"})


class CredentialVerifyRequest(BaseModel):
    inner_credential_code: str = Field(..., json_schema_extra={"example": "SECRET-HASH-INNER-9921"})
    unit_or_batch_id: str = Field(..., json_schema_extra={"example": "batch-raw-101"})


class QRResolveResponse(BaseModel):
    reference_id: str
    entity_type: str
    product_name: str
    current_state: str
    producer_org_id: str
    custodian_org_id: str
    trace_history: List[Dict[str, Any]]
    scan_history: List[Dict[str, Any]] = []
    scan_recorded: bool
    audit_tx_id: Optional[str] = None
    next_allowed_operation: str = "RECEIVE"
    warnings_or_block_status: str = "NONE"


class CredentialVerifyResponse(BaseModel):
    traceability: Dict[str, Any]
    authenticity: Dict[str, Any]
    audit_tx_id: str
