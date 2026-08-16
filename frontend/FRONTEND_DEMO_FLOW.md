# SIH 2026 — CANONICAL JUDGE DEMONSTRATION STORYBOARD

## 1. Demo Narrative Overview

This 5–7 minute live demonstration guides judges through a real-world food safety crisis and resolution story:

```
Green Valley Farms (Producer)
       │ Creates raw orange batch (B001)
       ▼
FreshHarvest Processing (Processor)
       │ Transforms B001 into Organic Orange Juice (B101)
       ▼
FastLogistics (Transporter)
       │ Transfers custody of B101 to FreshMart
       ▼
Consumer Scans QR Code
       │ Views full farm-to-fork journey & verifies inner physical authenticity
       ▼
Consumer Submits Complaint (Pesticide issue)
       │ Multiple complaints trigger automated escalation
       ▼
Regulator Runs Risk Propagator
       │ System calculates affected graph scope (B001 + B101)
       ▼
Regulator Issues Recall Action
       │ Batches updated to RECALLED status across Fabric blockchain & D1 read-model
```

---

## 2. Step-by-Step UI Execution Script

| Step | User Action | UI Page / Component | Endpoint Triggered | What Judge Sees on Screen |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Producer Login | `/login` | `POST /api/v1/auth/login` | JWT Bearer token issued, redirected to Producer Dashboard. |
| **2** | Create Raw Product & Batch | `/products`, `/batches` | `POST /api/v1/products`, `POST /api/v1/batches` | Success toast with Fabric Tx ID (`COMMITTED`). Batch `batch-orange-001-raw` appears in `REGISTERED` state. |
| **3** | Validate & Transfer | `/batches/[id]` | `POST /api/v1/batches/{id}/validate`, `POST /api/v1/batches/{id}/transfer` | Batch state changes to `VALIDATED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ Custodian: FreshHarvest. |
| **4** | Consumer Scans Outer QR | `/wetrack` or `/one-food` | `POST /api/v1/qr/resolve` | Beautiful timeline showing farm origin, processing facility, custody transfers, and non-mutating audit scan log. |
| **5** | Inner Authenticity Check | `/one-food` Authenticity Card | `POST /api/v1/qr/verify-credential` | Distinct green checkmark: **"Physical Authenticity Verified"** (explicitly separated from digital traceability). |
| **6** | Upload Lab Evidence | `/evidence` | `POST /api/v1/evidence/upload` | Certificate pinned to IPFS. Returns deterministic CID `Qm...`. |
| **7** | Consumer Files Complaints | `/one-food` Feedback Modal | `POST /api/v1/feedback/submit` | 3 complaints submitted $\rightarrow$ Status automatically escalates to `ESCALATED_WARNING`. |
| **8** | Regulator Inspects Incidents | `/admin/incidents` | `GET /api/v1/dashboard/incidents` | Escalated incident card highlighted in yellow/red with link to IPFS evidence CID. |
| **9** | Execute Risk Propagator | `/admin/risk` | `POST /api/v1/risk/propagate` | Interactive graph traversal highlighting origin batch `B001` and downstream derivative `B101`. |
| **10** | Issue Targeted Recall | `/admin/recalls` | `POST /api/v1/recall/recalls` | Confirmation modal $\rightarrow$ Status changes to `RECALLED`. Immutable audit log updated (`GET /api/v1/audit/trail`). |
