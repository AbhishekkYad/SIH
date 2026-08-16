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

export interface QRResolveResponse {
  reference_id: string;
  entity_type: string;
  product_name: string;
  current_state: string;
  producer_org_id: string;
  custodian_org_id: string;
  trace_history: Array<Record<string, any>>;
  scan_history: Array<Record<string, any>>;
  scan_recorded: boolean;
  audit_tx_id?: string;
  next_allowed_operation: string;
  warnings_or_block_status: string;
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
