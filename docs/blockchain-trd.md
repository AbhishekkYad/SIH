# Blockchain Technical Requirements Document (TRD)
## SIH 2026: Food Traceability Platform - Blockchain Microservice

This document freezes the technical specification for Developer 2's Blockchain Microservice. It serves as the definitive contract between the Data Service (Developer 1), Blockchain Service (Developer 2), and Application Service (Developer 3).

---

### 1. Blockchain Service Boundary
Developer 2 owns the Hyperledger Fabric Network, the Chaincode (with 3 logical contracts), and the Gateway API wrapper. **Crucially**, this service does NOT own PostgreSQL, Redis, or IPFS, nor does it contain business workflow orchestration (e.g., risk algorithms or frontend endpoints). 

### 2. Fabric Network Topology
- **Permissioned setup**: Minimum viable demonstration network (e.g., Fabric Test Network).
- **Nodes**: 1 Orderer, Minimum 2 Peers (to represent different organizations).

### 3. Organizations & MSPs
- `FarmerOrg`
- `ProcessorOrg`
- `TransporterOrg`
- `RetailerOrg`
- `RegulatorOrg`

### 4. Channel Configuration
- Single shared channel (`traceability-channel`) for the Base Model to simplify Phase 1 deployment.

### 5. Identity & Authorization Model
- Chaincode must verify authorization independently by extracting the invoking client's identity and MSP directly from the Fabric transaction context (`ctx.clientIdentity.getMSPID()`), never blindly trusting payloads.

### 6. On-Chain vs Off-Chain Data Strategy
- **On-chain (Fabric)**: Minimal trusted state transitions, custody records, validation states, audit event hashes, and IPFS CIDs for evidence.
- **Off-chain (Data Service/PostgreSQL)**: Rich queries, relational lineage mapping, massive consumer feedback aggregation, analytics. 

---
### Asset Schemas

#### 7. Product Asset Schema
```json
{
  "docType": "product",
  "product_id": "string",
  "name": "string",
  "product_type": "string",
  "created_by_org": "string (MSP ID)",
  "created_at": "timestamp"
}
```

#### 8. Batch Asset Schema
```json
{
  "docType": "batch",
  "batch_id": "string",
  "product_id": "string",
  "state": "enum (REGISTERED | VALIDATED | IN_TRANSIT | RECEIVED | PROCESSED | AVAILABLE | BLOCKED | RECALLED)",
  "current_custodian": "string (MSP ID)",
  "parent_refs": ["string"],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### 9. Unit Asset Schema
```json
{
  "docType": "unit",
  "unit_id": "string",
  "batch_id": "string",
  "state": "enum (same as batch)",
  "current_custodian": "string (MSP ID)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### 10. Incident Asset Schema
```json
{
  "docType": "incident",
  "incident_id": "string",
  "entity_id": "string (batch_id or unit_id)",
  "status": "enum (UNDER_INVESTIGATION | ESCALATED | RESOLVED)",
  "reporter_ref": "string",
  "evidence_cid": "string (optional IPFS hash)",
  "created_at": "timestamp"
}
```

#### 11. Recall Asset Schema
```json
{
  "docType": "recall",
  "recall_id": "string",
  "affected_scope_ref": "string",
  "authority": "string (MSP ID)",
  "status": "enum (ACTIVE | RESOLVED)",
  "timestamp": "timestamp"
}
```

#### 12. Audit Event Schema
```json
{
  "docType": "audit",
  "event_id": "string",
  "event_type": "enum (SCAN | VERIFICATION)",
  "entity_id": "string",
  "actor_id": "string (pseudonymous or MSP)",
  "timestamp": "timestamp",
  "verification_result": "string (optional)"
}
```

---
### Contracts

#### 13. TraceabilityContract
Handles strict state and custody changes.
- `registerProduct(productId, name, productType)`
- `registerBatch(batchId, productId, quantity)`
- `validateBatch(batchId, validationResult)`
- `receiveBatch(batchId)`
- `transferBatch(batchId, targetOrg)`
- `createTransformation(parentBatchIds[], childBatchId)`
- `createUnit(batchId, unitId)`
- `blockEntity(entityType, entityId, reason)` *(Note: renamed from blockBatch to blockEntity for Batch/Unit flexibility)*

#### 14. IncidentContract
Receives established incident/escalation actions from Application Service. Does NOT perform feedback aggregation.
- `startInvestigation(incidentId, entityId)`
- `updateIncidentStatus(incidentId, status)`
- `recordEscalation(incidentId, targetOrg)`
- `createRecallAction(recallId, scopeRef)`
- `closeIncident(incidentId)`

#### 15. AuditContract
Records interactions without mutating custody.
- `recordScan(entityId, scanContext)`
- `recordVerification(entityId, verificationResult)`

---
### Rules & Lifecycles

#### 16. State Transition Rules
- Must follow strict flow: `REGISTERED` -> `VALIDATED` -> `IN_TRANSIT` -> `RECEIVED` -> `PROCESSED` -> `AVAILABLE`.
- Any state can move to `BLOCKED`.
- `BLOCKED` can move to `RECALLED`.
- Chaincode must explicitly reject invalid transitions.

#### 17. Custody Rules
- `transferBatch` MUST be called by the `current_custodian`. Updates custodian to `IN_TRANSIT`.
- `receiveBatch` updates custodian to the receiving organization.

#### 18. Lineage Rules
- `createTransformation` must verify that parent batches exist and are in `PROCESSED` state. Child batch references parents.

#### 19. QR Verification Rules
- Outer QR = Traceability. Inner QR = Physical Authenticity. 
- Validation logic happens in App Service; Blockchain only records the `AuditContract.recordVerification()` result.

#### 20. Transaction Lifecycle
1. Gateway receives request.
2. Fabric endorsement & ordering.
3. Commit to ledger.
4. Gateway returns `COMMITTED` status and `transaction_id`. 
*Note: Gateway MUST wait for the commit event before returning success to Developer 3.*

#### 21. Fabric Events
Chaincode will emit explicit events for synchronization:
- `PRODUCT_REGISTERED`, `BATCH_REGISTERED`, `BATCH_VALIDATED`, `BATCH_RECEIVED`, `BATCH_TRANSFERRED`, `BATCH_TRANSFORMED`, `UNIT_CREATED`, `INCIDENT_CREATED`, `ENTITY_BLOCKED`, `RECALL_CREATED`.

#### 22. Gateway REST API
Exposes endpoints matching the chaincode functions (e.g., `POST /internal/transactions/batches`). Developer 3 uses this, never the Fabric SDK.

#### 23. Error Codes
Standardized codes: `INVALID_STATE`, `UNAUTHORIZED_ACTOR`, `DUPLICATE_ENTITY`, `ENTITY_NOT_FOUND`.

#### 24. Transaction Response Schemas
```json
{
  "transaction_id": "TX123",
  "status": "COMMITTED | FAILED",
  "entity_id": "B001",
  "error_code": "optional"
}
```

#### 25. Data-Service Synchronization Contract
Fabric transaction -> Gateway returns TX ID & Emits Fabric Event -> App Service orchestrates -> Data Service stores operation with `fabric_tx_id` for reconciliation.

#### 26. Idempotency / Transaction IDs
All requests to the Gateway must include an idempotency key (or rely on Fabric's native transaction ID checks) to prevent double-spending/duplicate transfers on network retries.

#### 27. Security Rules
- No private keys stored in the API layer.
- Gateway uses predefined client identities linked to specific MSPs.

#### 28. Chaincode Testing
Must cover 100% of state-machine transitions and RBAC authorization paths using `fabric-chaincode-node` testing utilities.

#### 29. Gateway Testing
Must include integration tests hitting the API endpoints and confirming ledger commits.

#### 30. Definition of Done
Developer 2 hands over a running Docker-based Fabric network and the Gateway API URL. Developer 3 can hit `POST /internal/transactions/...` and receive `COMMITTED` status without knowing what a "peer" or "orderer" is.
