# Technical Requirements Document (TRD)
## Food Traceability + Authenticity + Consumer Accountability + Risk Response Platform

### 1. Objective & Architecture Overview
Build the Base Model core platform.
**Stack**:
- **Frontend**: Next.js / React (Consumer UI & Stakeholder Dashboard)
- **Backend API**: FastAPI (Python)
- **Database**: PostgreSQL (Operational, Query, Lineage)
- **Cache**: Redis (Fast reads)
- **Storage**: IPFS (Large evidence files, CID references)
- **Blockchain**: Hyperledger Fabric (Gateway + Chaincode)

**Team Structure (6 Members)**:
- **Frontend Team (3)**: Focus on Consumer App, Stakeholder Dashboard, QR scanning UI, Authentication flows.
- **Backend/Blockchain Team (3)**: Focus on FastAPI backend, PostgreSQL schema, Risk Propagator logic, Hyperledger Fabric network setup, and Chaincode (Smart Contracts).

### 2. Component Responsibilities
- **Next.js (UI)**: Consumer and Stakeholder interfaces. No business rule authority.
- **FastAPI (Backend)**: Orchestration, RBAC validation, queries, IPFS/Fabric integration.
- **PostgreSQL**: Primary operational read-model.
- **Redis**: Caching layer. Must be rebuildable from PostgreSQL/Fabric.
- **IPFS**: Stores certificates, lab reports, and feedback evidence. CIDs are stored in PostgreSQL/Fabric.
- **Hyperledger Fabric**: Permissioned trust layer. Chaincode enforces critical state transitions and authorization.

### 3. Data & Consistency Model
**Fabric ↔ PostgreSQL Consistency**:
Dual writes are avoided. The backend submits a transaction to Fabric -> Fabric commits -> Backend listens for the commit event -> PostgreSQL operational read model is updated -> Redis cache invalidated.

**Lineage Data Structure**:
Stored in PostgreSQL as indexed adjacency relationships (`parent_batch_id`, `child_batch_id`). Used by the Risk Propagator for efficient recursive queries.

**PostgreSQL Schema Overview**:
Key tables include: `organizations`, `users`, `roles`, `permissions`, `products`, `batches`, `units`, `lineage_edges`, `custody_events`, `events`, `scan_events`, `qr_credentials`, `incidents`, `feedback_evidence`, `evidence`, `accountability_records`, `escalations`, `risk_scopes`, `risk_scope_nodes`, `recall_actions`, `audit_log`.

### 4. Smart Contracts & Scan Flow
**One Chaincode Package, Three Logical Contracts**:
1. **TraceabilityContract**: Handles product, batch, unit, lifecycle, receipt, transfer, transformation, and lineage-related trusted state.
2. **IncidentContract**: Handles investigation, block, recall action, incident status, and accountability/escalation commitments.
3. **AuditContract**: Records stakeholder/consumer scan events, verification events, and audit-only interactions.

**Scan Flow vs Business Event**:
A scan is an interaction recorded by `AuditContract`. It does NOT change product ownership or state. A subsequent, explicit action (like "receive" or "transfer") is required to execute a business event via `TraceabilityContract`, which updates the product's state and ownership.

### 5. Backend API Contract (Base)
- `Auth`: login, getMe, createOrganization, assignRole
- `Products`: createProduct, getProduct
- `Batches`: createBatch, validateBatch, getBatch
- `Units`: createUnit, getUnit
- `Events`: getEvents, submitBusinessOperation
- `Lineage`: getParents, getChildren, getLineage
- `QR / Scans`: resolveQR, generateQR, verifyCredential, recordScan
- `Feedback/Incident`: submitFeedback, getIncident, updateIncidentStatus
- `Risk & Recall`: propagateRisk, getRiskScope, blockBatch, createRecallAction

### 6. Development & Implementation Order
1. Freeze entities, permissions, and lifecycle states.
2. Setup PostgreSQL schema + migrations.
3. Setup Fabric network and chaincode skeleton.
4. Implement one chaincode package with the three logical contracts.
5. Implement product/batch/unit creation.
6. Implement lineage + receive/transfer flows.
7. Sync Fabric events to PostgreSQL read-model.
8. Implement QR resolution and stakeholder/consumer scan flows.
9. Implement IPFS evidence uploads.
10. Implement consumer feedback & accountability logic.
11. Implement Risk Propagator logic.
12. Build Dashboards & Consumer UI (Frontend).
