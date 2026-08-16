# SIH 2026 — FRONTEND API HANDOFF & CATALOG

**Base Model Freeze Version**: 1.0.0  
**Target Backend Service**: Application Service (Developer 3 / Orchestrator)  
**Base URL**: `http://localhost:8000` (or `NEXT_PUBLIC_API_BASE_URL`)  
**Specification**: OpenAPI 3.1 (`/openapi.json`)

---

## 1. Executive Summary & Client Architecture

All frontend interactions MUST flow directly through **Developer 3 Application Service** (FastAPI at `http://localhost:8000`). The frontend NEVER directly queries PostgreSQL, Redis, IPFS, or Hyperledger Fabric Gateway.

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND WEB APP                    │
│      (Next.js 14 App Router / React 18 TypeScript)      │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON (Bearer JWT)
                             ▼
┌─────────────────────────────────────────────────────────┐
│       DEVELOPER 3 APPLICATION SERVICE (FASTAPI)         │
│  Orchestration, RBAC, QR Resolution, Risk & Dashboards  │
└────────┬───────────────────┬───────────────────┬────────┘
         │ internal API      │ gRPC / REST       │ internal API
         ▼                   ▼                   ▼
 ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
 │  DEVELOPER 1  │   │  DEVELOPER 2  │   │     IPFS      │
 │ DATA SERVICE  │   │ BLOCKCHAIN CS │   │ OFF-CHAIN STORE│
 │ (PG + Redis)  │   │ (Fabric GW)   │   │  (Lab Evid)   │
 └───────────────┘   └───────────────┘   └───────────────┘
```

---

## 2. Complete API Endpoint Catalog

| Endpoint | Method | Role Required | MOCK_MODE | Real Mode Backend Flow | Frontend Component / Page |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | POST | Public | ✅ Working | Generates JWT Bearer token | `LoginPage` / `Navbar` |
| `/api/v1/auth/me` | GET | Authenticated | ✅ Working | Decodes JWT identity & org | `UserProfile` / `Navbar` |
| `/api/v1/products` | POST | `producer`, `processor`, `manufacturer`, `admin` | ✅ Working | Gateway $\rightarrow$ Fabric $\rightarrow$ D1 PG | `ProductCreateForm` |
| `/api/v1/products/{product_id}` | GET | Authenticated | ✅ Working | Queries D1 PG Read-model | `ProductDetailsCard` |
| `/api/v1/batches` | POST | `farmer`, `supplier`, `producer`, `processor`, `manufacturer`, `admin` | ✅ Working | Gateway $\rightarrow$ Fabric $\rightarrow$ D1 PG | `BatchCreateForm` |
| `/api/v1/batches/{batch_id}` | GET | Authenticated | ✅ Working | Queries D1 PG Read-model | `BatchDetailsPage` |
| `/api/v1/batches/{batch_id}/validate` | POST | `producer`, `processor`, `manufacturer`, `admin` | ✅ Working | Fabric Validate Tx $\rightarrow$ D1 PG | `BatchValidateAction` |
| `/api/v1/batches/{batch_id}/transfer` | POST | `farmer`, `producer`, `processor`, `manufacturer`, `transporter`, `admin` | ✅ Working | Fabric Transfer Tx $\rightarrow$ D1 PG | `CustodyTransferModal` |
| `/api/v1/units` | POST | `manufacturer`, `processor`, `admin` | ✅ Working | Unit identity creation in D1 | `UnitCreateForm` |
| `/api/v1/units/{unit_id}` | GET | Authenticated | ✅ Working | Unit details from D1 | `UnitDetailsModal` |
| `/api/v1/lineage/{batch_id}` | GET | Authenticated | ✅ Working | PG Recursive CTE Traversal | `LineageGraphView` |
| `/api/v1/lineage/{batch_id}/parents` | GET | Authenticated | ✅ Working | Upstream Parent Edges | `ParentBatchesList` |
| `/api/v1/lineage/{batch_id}/children` | GET | Authenticated | ✅ Working | Downstream Child Edges | `ChildBatchesList` |
| `/api/v1/qr/resolve` | POST | Public / Optional Token | ✅ Working | Non-mutating scan record + trace | `QRScannerPage` / `/wetrack` |
| `/api/v1/qr/verify-credential` | POST | Public / Optional Token | ✅ Working | Inner authenticity check | `AuthenticityChecker` |
| `/api/v1/evidence/upload` | POST | Authenticated | ✅ Working | IPFS Pinning / Mock CID | `EvidenceUploadWidget` |
| `/api/v1/evidence/{cid}` | GET | Authenticated | ✅ Working | IPFS Metadata lookup | `EvidenceViewer` |
| `/api/v1/feedback/submit` | POST | Authenticated | ✅ Working | Incident Creation + Escalation | `ConsumerFeedbackModal` |
| `/api/v1/feedback/incidents/{incident_id}` | GET | Authenticated | ✅ Working | Incident Details | `IncidentCard` |
| `/api/v1/risk/propagate` | POST | `manufacturer`, `regulator`, `admin` | ✅ Working | Lineage Graph Scope Traverse | `RiskPropagatorView` |
| `/api/v1/recall/block` | POST | `manufacturer`, `regulator`, `admin` | ✅ Working | Fabric Block Tx $\rightarrow$ D1 state | `BlockBatchModal` |
| `/api/v1/recall/recalls` | POST | `manufacturer`, `regulator`, `admin` | ✅ Working | Targeted Recall Action | `IssueRecallModal` |
| `/api/v1/dashboard/supply-chain-overview` | GET | Authenticated | ✅ Working | Global KPI Aggregation | `ExecutiveDashboard` |
| `/api/v1/dashboard/batches` | GET | `producer`, `processor`, `manufacturer`, `transporter`, `retailer`, `regulator`, `admin` | ✅ Working | Batch Operational Table | `BatchesTable` |
| `/api/v1/dashboard/incidents` | GET | `manufacturer`, `regulator`, `admin` | ✅ Working | Incident Management Grid | `IncidentDashboard` |
| `/api/v1/audit/trail` | GET | `regulator`, `admin` | ✅ Working | Immutable Audit Log | `AuditTrailPage` |

---

## 3. Detailed Request/Response Specs

### 3.1 Auth — `POST /api/v1/auth/login`
- **Request**:
  ```json
  {
    "username": "john_producer",
    "password": "password123",
    "role": "producer",
    "org_id": "11111111-1111-1111-1111-111111111111"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in_minutes": 1440,
    "user_id": "usr-john_producer",
    "role": "producer",
    "org_id": "11111111-1111-1111-1111-111111111111"
  }
  ```

### 3.2 QR Resolve — `POST /api/v1/qr/resolve`
- **Request**:
  ```json
  {
    "qr_reference": "batch-orange-001-raw",
    "session_ref": "sess-xyz789"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "qr_reference": "batch-orange-001-raw",
    "entity_type": "BATCH",
    "verification": {
      "traceability": "VERIFIED",
      "authenticity": "VERIFIED",
      "message": "Product traceability verified"
    },
    "product": {
      "product_id": "prd-orange-001",
      "product_name": "Organic Valencia Oranges",
      "category": "RAW_MATERIAL",
      "batch_id": "batch-orange-001-raw",
      "source_of_raw_materials": [],
      "ingredients": [],
      "label_information": {}
    },
    "current_status": {
      "lifecycle_state": "VALIDATED",
      "current_custodian": {
        "organization_id": "11111111-1111-1111-1111-111111111111",
        "organization_name": "Orange Grove Farm",
        "role": "PRODUCER"
      },
      "risk_status": "CLEAR",
      "recall_status": "NOT_RECALLED"
    },
    "origin": {
      "batch_id": "batch-orange-001-raw",
      "producer": {
        "organization_id": "11111111-1111-1111-1111-111111111111",
        "organization_name": "Orange Grove Farm",
        "role": "PRODUCER"
      },
      "product": "Organic Valencia Oranges",
      "location": {
        "location_name": "Nagpur, Maharashtra",
        "latitude": 21.1458,
        "longitude": 79.0882
      },
      "condition": {}
    },
    "lineage": {
      "parents": [],
      "current_batch": "batch-orange-001-raw",
      "children": []
    },
    "trace_history": [
      {
        "sequence": 1,
        "event_name": "BATCH_REGISTERED",
        "action": "Producer registered raw orange batch",
        "actor": {
          "organization_id": "11111111-1111-1111-1111-111111111111",
          "organization_name": "Orange Grove Farm",
          "role": "PRODUCER",
          "fabric_msp": "Org1MSP"
        },
        "location": {
          "location_name": "Nagpur, Maharashtra",
          "latitude": 21.1458,
          "longitude": 79.0882
        },
        "conditions": {},
        "blockchain": {
          "transaction_id": "tx-demo-fabric-1001",
          "channel_id": "traceability-channel",
          "block_number": 1,
          "commit_status": "COMMITTED"
        },
        "evidence": []
      }
    ],
    "scan_history": [
      {
        "type": "STAKEHOLDER_SCAN",
        "timestamp": "2026-08-16T08:00:00Z"
      }
    ],
    "quality_and_testing": {},
    "certifications": [],
    "transport": {},
    "evidence": [],
    "risk": {
      "status": "CLEAR",
      "level": "LOW",
      "affected_batches": [],
      "affected_custodians": [],
      "affected_locations": []
    },
    "recall": {
      "status": "NOT_RECALLED",
      "scope": []
    }
  }
  ```

### 3.3 Inner Authenticity — `POST /api/v1/qr/verify-credential`
- **Request**:
  ```json
  {
    "unit_or_batch_id": "batch-orange-001-raw",
    "inner_credential_code": "SEC-CRED-998877"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "traceability": {
      "verified": true,
      "batch_id": "batch-orange-001-raw"
    },
    "authenticity": {
      "verified": true,
      "credential_id": "SEC-CRED-998877",
      "message": "Inner physical credential verified authentic."
    },
    "audit_tx_id": "tx-mock-verify-e5f6g7h8"
  }
  ```

### 3.4 Risk Propagator — `POST /api/v1/risk/propagate`
- **Request**:
  ```json
  {
    "origin_batch_id": "batch-orange-001-raw",
    "risk_level": "CRITICAL",
    "reason": "Pesticide contamination detected in lab analysis"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "origin_batch_id": "batch-orange-001-raw",
    "risk_level": "CRITICAL",
    "total_affected_batches": 2,
    "affected_batches": [
      {
        "batch_id": "batch-orange-001-raw",
        "direction": "ORIGIN",
        "distance": 0,
        "current_custodian_org_id": "11111111-1111-1111-1111-111111111111",
        "current_state": "VALIDATED"
      },
      {
        "batch_id": "batch-juice-101-proc",
        "direction": "DOWNSTREAM",
        "distance": 1,
        "current_custodian_org_id": "22222222-2222-2222-2222-222222222222",
        "current_state": "RECEIVED"
      }
    ],
    "propagated_at": "2026-08-16T03:50:00Z"
  }
  ```
