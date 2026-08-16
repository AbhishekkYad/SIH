# SIH 2026 — FRONTEND TYPESCRIPT DEFINITIONS (`src/types/api.ts`)

Frontend developers can copy and paste these exact TypeScript definitions into `frontend/src/types/api.ts` to instantly have 100% type-safe integration with the FastAPI backend schemas:

```typescript
// Authentication Types
export interface LoginRequest {
  username: string;
  password?: string;
  role?: string;
  org_id?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  user_id: string;
  role: string;
  org_id: string;
}

export interface UserMeResponse {
  user_id: string;
  role: string;
  org_id: string;
  status: string;
}

// Product Types
export interface ProductCreate {
  name: string;
  sku: string;
  category: "RAW_MATERIAL" | "PROCESSED_GOOD" | "PACKAGED_FOOD";
  attributes?: Record<string, any>;
}

export interface ProductResponse {
  product_id: string;
  name: string;
  sku: string;
  category: string;
  created_at: string;
  attributes?: Record<string, any>;
}

// Batch Types
export type LifecycleState = "REGISTERED" | "VALIDATED" | "IN_TRANSIT" | "RECEIVED" | "TRANSFORMED" | "BLOCKED" | "RECALLED";

export interface BatchCreate {
  product_id: string;
  quantity: number;
  unit_of_measure: string;
  producer_org_id?: string;
  parent_batch_ids?: string[];
}

export interface BatchValidateRequest {
  notes?: string;
}

export interface CustodyTransferRequest {
  to_org_id: string;
  transporter_org_id?: string;
  notes?: string;
}

export interface BatchResponse {
  batch_id: string;
  product_id: string;
  quantity: number;
  unit_of_measure: string;
  producer_org_id: string;
  current_custodian_org_id: string;
  lifecycle_state: LifecycleState;
  created_at: string;
  parent_batch_ids?: string[];
}

// QR & Authenticity Types
export interface QRResolveRequest {
  qr_reference: string;
  session_ref?: string;
}

export interface TraceVerification {
  traceability: string;
  authenticity: string;
  message: string;
}

export interface ProductDossier {
  product_id: string;
  product_name: string;
  brand?: string;
  category: string;
  batch_id: string;
  production_date?: string;
  shelf_life?: string;
  quantity?: number;
  unit?: string;
  product_standard?: string;
  source_of_raw_materials: Array<Record<string, any>>;
  ingredients: string[];
  allergen_information?: string;
  label_information: Record<string, any>;
}

export interface CustodianInfo {
  organization_id: string;
  organization_name: string;
  role: string;
}

export interface CurrentStatus {
  lifecycle_state: string;
  current_custodian: CustodianInfo;
  expected_custodian?: CustodianInfo;
  risk_status: string;
  recall_status: string;
}

export interface OriginLocation {
  location_name?: string;
  latitude?: number;
  longitude?: number;
}

export interface OriginDossier {
  batch_id: string;
  producer: CustodianInfo;
  product: string;
  location: OriginLocation;
  production_date?: string;
  condition: Record<string, any>;
}

export interface LineageNode {
  batch_id?: string;
  unit_id?: string;
  product_name?: string;
  relationship: string;
}

export interface LineageDossier {
  parents: LineageNode[];
  current_batch?: string;
  children: LineageNode[];
}

export interface TraceActor {
  user_id?: string;
  organization_id: string;
  organization_name: string;
  role: string;
  fabric_msp?: string;
}

export interface TraceCustody {
  previous_custodian?: string;
  current_custodian: string;
  expected_custodian?: string;
  destination?: string;
}

export interface TraceBlockchain {
  transaction_id?: string;
  channel_id?: string;
  block_number?: number;
  event_name?: string;
  commit_status: string;
}

export interface TraceEvidence {
  type: string;
  cid: string;
  filename?: string;
  available: boolean;
}

export interface TraceEvent {
  sequence: number;
  event_name: string;
  action: string;
  actor: TraceActor;
  product?: Record<string, any>;
  timestamp?: string;
  location: OriginLocation;
  conditions: Record<string, any>;
  custody?: TraceCustody;
  transformation?: Record<string, any>;
  blockchain: TraceBlockchain;
  evidence: TraceEvidence[];
  scan?: Record<string, any>;
}

export interface RiskOriginIncident {
  incident_id: string;
  category: string;
  reported_by: string;
  reported_at: string;
  evidence_cid?: string;
}

export interface RiskAffectedBatch {
  batch_id: string;
  direction: string;
  distance: number;
  current_custodian?: string;
  location?: string;
}

export interface RiskDossier {
  status: string;
  level: string;
  origin_incident?: RiskOriginIncident;
  origin_batch?: string;
  affected_batches: RiskAffectedBatch[];
  affected_custodians: string[];
  affected_locations: string[];
}

export interface RecallDossier {
  status: string;
  recall_id?: string;
  issued_by?: string;
  issued_at?: string;
  scope: string[];
}

export interface QRResolveResponse {
  qr_reference: string;
  entity_type: string;
  verification: TraceVerification;
  product: ProductDossier;
  current_status: CurrentStatus;
  origin?: OriginDossier;
  lineage: LineageDossier;
  trace_history: TraceEvent[];
  scan_history: Array<Record<string, any>>;
  quality_and_testing: Record<string, any>;
  certifications: Array<Record<string, any>>;
  transport: Record<string, any>;
  evidence: TraceEvidence[];
  risk: RiskDossier;
  recall: RecallDossier;
}

export interface CredentialVerifyRequest {
  unit_or_batch_id: string;
  inner_credential_code: string;
}

export interface CredentialVerifyResponse {
  traceability: {
    verified: boolean;
    batch_id: string;
  };
  authenticity: {
    verified: boolean;
    credential_id: string;
    message: string;
  };
  audit_tx_id: string;
}

// Feedback & Incident Types
export interface FeedbackSubmitRequest {
  batch_or_unit_id: string;
  category: "CONTAMINATION" | "TAMPERING" | "PACKAGING_DAMAGE" | "QUALITY_DEFECT";
  description: string;
  evidence_filename?: string;
  evidence_base64?: string;
}

export interface IncidentResponse {
  incident_id: string;
  batch_or_unit_id: string;
  category: string;
  description: string;
  nearest_accountable_org_id: string;
  evidence_cid?: string;
  status: "SUBMITTED" | "INVESTIGATING" | "ESCALATED" | "RESOLVED";
  escalation_level: string;
  created_at: string;
}

// Risk & Recall Types
export interface RiskPropagateRequest {
  origin_batch_id: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
}

export interface AffectedBatchNode {
  batch_id: string;
  direction: "ORIGIN" | "UPSTREAM" | "DOWNSTREAM";
  distance: number;
  current_custodian_org_id: string;
  current_state: string;
}

export interface RiskScopeResponse {
  origin_batch_id: string;
  risk_level: string;
  total_affected_batches: number;
  affected_batches: AffectedBatchNode[];
  propagated_at: string;
}
```
