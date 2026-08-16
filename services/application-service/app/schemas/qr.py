from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class QRResolveRequest(BaseModel):
    qr_reference: str = Field(..., json_schema_extra={"example": "batch-raw-101"})
    session_ref: Optional[str] = Field(None, json_schema_extra={"example": "anon-session-9912a"})


class CredentialVerifyRequest(BaseModel):
    inner_credential_code: str = Field(..., json_schema_extra={"example": "SECRET-HASH-INNER-9921"})
    unit_or_batch_id: str = Field(..., json_schema_extra={"example": "batch-raw-101"})


class TraceVerification(BaseModel):
    traceability: str = "VERIFIED"
    authenticity: str = "VERIFIED"
    message: str = "Product traceability verified"

class ProductDossier(BaseModel):
    product_id: str
    product_name: str
    brand: Optional[str] = None
    category: str
    batch_id: str
    production_date: Optional[str] = None
    shelf_life: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    product_standard: Optional[str] = None
    source_of_raw_materials: List[Dict[str, Any]] = []
    ingredients: List[str] = []
    allergen_information: Optional[str] = None
    label_information: Dict[str, Any] = {}

class CustodianInfo(BaseModel):
    organization_id: str
    organization_name: str
    role: str

class CurrentStatus(BaseModel):
    lifecycle_state: str
    current_custodian: CustodianInfo
    expected_custodian: Optional[CustodianInfo] = None
    risk_status: str = "CLEAR"
    recall_status: str = "NOT_RECALLED"

class OriginLocation(BaseModel):
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class OriginDossier(BaseModel):
    batch_id: str
    producer: CustodianInfo
    product: str
    location: OriginLocation
    production_date: Optional[str] = None
    condition: Dict[str, Any] = {}

class LineageNode(BaseModel):
    batch_id: Optional[str] = None
    unit_id: Optional[str] = None
    product_name: Optional[str] = None
    relationship: str = "UNKNOWN"

class LineageDossier(BaseModel):
    parents: List[LineageNode] = []
    current_batch: Optional[str] = None
    children: List[LineageNode] = []

class TraceActor(BaseModel):
    user_id: Optional[str] = None
    organization_id: str
    organization_name: str
    role: str
    fabric_msp: Optional[str] = None

class TraceCustody(BaseModel):
    previous_custodian: Optional[str] = None
    current_custodian: str
    expected_custodian: Optional[str] = None
    destination: Optional[str] = None

class TraceBlockchain(BaseModel):
    transaction_id: Optional[str] = None
    channel_id: Optional[str] = None
    block_number: Optional[int] = None
    event_name: Optional[str] = None
    commit_status: str = "COMMITTED"

class TraceEvidence(BaseModel):
    type: str
    cid: str
    filename: Optional[str] = None
    available: bool = True

class TraceEvent(BaseModel):
    sequence: int
    event_name: str
    action: str
    actor: TraceActor
    product: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None
    location: OriginLocation
    conditions: Dict[str, Any] = {}
    custody: Optional[TraceCustody] = None
    transformation: Optional[Dict[str, Any]] = None
    blockchain: TraceBlockchain
    evidence: List[TraceEvidence] = []
    scan: Optional[Dict[str, Any]] = None

class RiskOriginIncident(BaseModel):
    incident_id: str
    category: str
    reported_by: str
    reported_at: str
    evidence_cid: Optional[str] = None

class RiskAffectedBatch(BaseModel):
    batch_id: str
    direction: str
    distance: int
    current_custodian: Optional[str] = None
    location: Optional[str] = None

class RiskDossier(BaseModel):
    status: str = "CLEAR"
    level: str = "LOW"
    origin_incident: Optional[RiskOriginIncident] = None
    origin_batch: Optional[str] = None
    affected_batches: List[RiskAffectedBatch] = []
    affected_custodians: List[str] = []
    affected_locations: List[str] = []

class RecallDossier(BaseModel):
    status: str = "NOT_RECALLED"
    recall_id: Optional[str] = None
    issued_by: Optional[str] = None
    issued_at: Optional[str] = None
    scope: List[str] = []

class QRResolveResponse(BaseModel):
    qr_reference: str
    entity_type: str

    verification: TraceVerification = Field(default_factory=TraceVerification)
    product: ProductDossier
    current_status: CurrentStatus
    origin: Optional[OriginDossier] = None
    lineage: LineageDossier = Field(default_factory=LineageDossier)
    
    trace_history: List[TraceEvent] = []
    scan_history: List[Dict[str, Any]] = []
    
    quality_and_testing: Dict[str, Any] = {}
    certifications: List[Dict[str, Any]] = []
    transport: Dict[str, Any] = {}
    evidence: List[TraceEvidence] = []
    
    risk: RiskDossier = Field(default_factory=RiskDossier)
    recall: RecallDossier = Field(default_factory=RecallDossier)


class CredentialVerifyResponse(BaseModel):
    traceability: Dict[str, Any]
    authenticity: Dict[str, Any]
    audit_tx_id: str
