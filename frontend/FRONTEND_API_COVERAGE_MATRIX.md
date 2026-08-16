# SIH 2026 — MASTER API TO SCREEN COVERAGE MATRIX

To ensure ZERO backend endpoints are orphaned, every single endpoint in the OpenAPI catalog is mapped below to its primary frontend consumer:

| Backend Endpoint | Frontend Page | Component | User Role | User Action | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/login` | `/login` | `LoginForm` | All | Submit credentials | Stores JWT Bearer token & sets global user context |
| `GET /api/v1/auth/me` | Global / Header | `Navbar` | Authenticated | Page mount | Displays current logged-in user identity & organization |
| `POST /api/v1/products` | `/products` | `ProductCreateForm` | `producer`, `processor`, `manufacturer`, `admin` | Register food product | Returns created product object with UUID |
| `GET /api/v1/products/{id}` | `/products/[id]` | `ProductDetails` | Authenticated | Click product card | Displays product metadata & category |
| `POST /api/v1/batches` | `/batches` | `BatchCreateForm` | `farmer`, `producer`, `processor`, `manufacturer`, `admin` | Create new batch | Creates batch, triggers Fabric transaction & D1 read-model |
| `GET /api/v1/batches/{id}` | `/batches/[id]` | `BatchHeaderCard` | Authenticated | View batch | Displays quantity, lifecycle state, custodian & producer |
| `POST /api/v1/batches/{id}/validate` | `/batches/[id]` | `BatchValidateAction` | `producer`, `processor`, `manufacturer`, `admin` | Click "Validate Batch" | Transitions state to `VALIDATED` via Fabric transaction |
| `POST /api/v1/batches/{id}/transfer` | `/batches/[id]` | `TransferCustodyModal` | `farmer`, `producer`, `processor`, `transporter`, `admin` | Select recipient & transfer | Transitions state to `IN_TRANSIT` and updates custodian |
| `POST /api/v1/units` | `/batches/[id]` | `CreateUnitForm` | `manufacturer`, `processor`, `admin` | Generate unit serials | Creates unit records attached to batch |
| `GET /api/v1/units/{id}` | `/units/[id]` | `UnitDetailsModal` | Authenticated | View unit | Displays unit status and inner credential code |
| `GET /api/v1/lineage/{id}` | `/batches/[id]` | `LineageGraph` | Authenticated | View lineage tab | Renders interactive upstream/downstream graph |
| `GET /api/v1/lineage/{id}/parents` | `/batches/[id]` | `ParentBatchesCard` | Authenticated | View lineage tab | Displays list of upstream parent batches |
| `GET /api/v1/lineage/{id}/children` | `/batches/[id]` | `ChildBatchesCard` | Authenticated | View lineage tab | Displays list of downstream child batches |
| `POST /api/v1/qr/resolve` | `/one-food`, `/wetrack` | `QRResolverWidget` | Public / Consumer | Scan or enter QR ref | Displays farm-to-fork journey timeline & scan log |
| `POST /api/v1/qr/verify-credential` | `/one-food` | `AuthenticityChecker` | Public / Consumer | Enter inner code | Displays physical authenticity verification badge |
| `POST /api/v1/evidence/upload` | `/evidence`, `/one-food` | `EvidenceUploader` | Authenticated / Consumer | Upload lab report | Pins evidence off-chain to IPFS and returns CID |
| `GET /api/v1/evidence/{cid}` | `/evidence` | `EvidenceViewerModal` | Authenticated | Click CID link | Displays evidence file metadata & verification |
| `POST /api/v1/feedback/submit` | `/one-food` | `ConsumerFeedbackModal` | Public / Consumer | Submit complaint | Registers incident & evaluates escalation threshold |
| `GET /api/v1/feedback/incidents/{id}` | `/admin/incidents` | `IncidentDetailsCard` | Authenticated | View incident | Displays complaint details, evidence CID, and status |
| `POST /api/v1/risk/propagate` | `/admin/risk` | `RiskPropagatorGraph` | `manufacturer`, `regulator`, `admin` | Run risk evaluation | Highlights affected batches across recursive lineage |
| `POST /api/v1/recall/block` | `/admin/recalls` | `BlockBatchModal` | `manufacturer`, `regulator`, `admin` | Block batch | Sets batch state to `BLOCKED` in Fabric & D1 |
| `POST /api/v1/recall/recalls` | `/admin/recalls` | `IssueRecallModal` | `manufacturer`, `regulator`, `admin` | Issue recall order | Sets affected scope batches to `RECALLED` |
| `GET /api/v1/dashboard/supply-chain-overview` | `/dashboard` | `KPISummaryGrid` | Authenticated | View dashboard | Displays total batches, active alerts, and custody count |
| `GET /api/v1/dashboard/batches` | `/dashboard` | `BatchesDataGrid` | `producer`, `processor`, `transporter`, `retailer`, `admin` | View dashboard | Table of operational batches with filter options |
| `GET /api/v1/dashboard/incidents` | `/admin/incidents` | `IncidentsDataGrid` | `manufacturer`, `regulator`, `admin` | View incidents tab | Grid of active consumer complaints & escalation levels |
| `GET /api/v1/audit/trail` | `/admin/audit` | `AuditLogTable` | `regulator`, `admin` | View audit trail | Table of immutable blockchain/read-model interaction logs |
