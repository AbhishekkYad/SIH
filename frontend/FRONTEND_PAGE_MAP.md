# SIH 2026 — FRONTEND INFORMATION ARCHITECTURE & PAGE MAP

## 1. Public & Consumer Experience

| Route | Page Name | Primary UX Purpose | Consumed Backend APIs |
| :--- | :--- | :--- | :--- |
| `/` | Landing / Home | Public entry portal, solution overview & quick scan input | Static / None |
| `/wetrack` | Quick Track | Universal search input for Batch ID or QR reference | `POST /api/v1/qr/resolve` |
| `/one-food` | Consumer QR Experience | Comprehensive trace story, inner authenticity verification, evidence, feedback | `POST /api/v1/qr/resolve`, `POST /api/v1/qr/verify-credential`, `POST /api/v1/feedback/submit` |

---

## 2. Stakeholder Experience (Producer, Processor, Logistics, Retailer)

| Route | Page Name | Primary UX Purpose | Consumed Backend APIs |
| :--- | :--- | :--- | :--- |
| `/login` | Authentication Portal | Stakeholder login & role context selection | `POST /api/v1/auth/login` |
| `/dashboard` | Operational Dashboard | Supply chain KPI metrics, active batches table, active alerts | `GET /api/v1/dashboard/supply-chain-overview`, `GET /api/v1/dashboard/batches` |
| `/products` | Products Catalog | List registered food product definitions & create new products | `POST /api/v1/products`, `GET /api/v1/products/{id}` |
| `/batches` | Batch Management | List, filter, and register new food batches | `POST /api/v1/batches`, `GET /api/v1/batches/{id}` |
| `/batches/[id]` | Batch Details & Lineage | Detailed batch state, custody history, parent/child lineage graph, scan history | `GET /api/v1/batches/{id}`, `GET /api/v1/lineage/{id}`, `POST /api/v1/batches/{id}/validate`, `POST /api/v1/batches/{id}/transfer` |
| `/evidence` | Lab Reports & IPFS | Upload laboratory test reports or certificates & view IPFS CIDs | `POST /api/v1/evidence/upload`, `GET /api/v1/evidence/{cid}` |

---

## 3. Regulator & Admin Experience

| Route | Page Name | Primary UX Purpose | Consumed Backend APIs |
| :--- | :--- | :--- | :--- |
| `/admin/incidents` | Incident Investigation | View escalated consumer complaints & accountable organizations | `GET /api/v1/dashboard/incidents`, `GET /api/v1/feedback/incidents/{id}` |
| `/admin/risk` | Risk Propagator | Calculate bidirectional affected batch scopes across lineage graph | `POST /api/v1/risk/propagate` |
| `/admin/recalls` | Targeted Recall Action | Issue official batch block / targeted recall orders | `POST /api/v1/recall/block`, `POST /api/v1/recall/recalls` |
| `/admin/audit` | Immutable Audit Log | View immutable audit trail of stakeholder interactions & scan records | `GET /api/v1/audit/trail` |
