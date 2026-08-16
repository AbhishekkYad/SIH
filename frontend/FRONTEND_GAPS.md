# SIH 2026 — FRONTEND CURRENT GAPS & ACTION ITEMS

## 1. What Exists Right Now in `frontend/`

- **Framework**: Next.js 14.2 (App Router), React 18.3, TypeScript 5.
- **Pages Implemented**:
  - `/` (Landing Page with rich hero, mission, and features grid).
  - `/one-food` (Consumer QR Experience UI mock).
  - `/wetrack` (Quick QR code / Batch ID search UI mock).
- **Styling**: CSS Modules with custom design tokens.

---

## 2. Identified Gaps & Missing Frontend Pages

| Gap Area | Impact | Required Action for Frontend Team |
| :--- | :--- | :--- |
| **Authentication Flow** | Low | Add `/login` route connected to `POST /api/v1/auth/login` and store Bearer JWT token in `localStorage`. |
| **API Client Integration** | Medium | Wire up existing static pages (`/one-food`, `/wetrack`) to use `apiClient` (`POST /api/v1/qr/resolve`, `POST /api/v1/qr/verify-credential`). |
| **Stakeholder Dashboard** | High | Build `/dashboard` route with KPI cards and batch operational grid consuming `GET /api/v1/dashboard/supply-chain-overview` and `GET /api/v1/dashboard/batches`. |
| **Batch Detail Page** | High | Build `/batches/[id]` route with tabs for batch header, custody history, and parent/child lineage visualization using `GET /api/v1/batches/{id}` and `GET /api/v1/lineage/{id}`. |
| **Regulator & Recall Panel** | High | Build `/admin/risk` and `/admin/recalls` routes for running Risk Propagator (`POST /api/v1/risk/propagate`) and issuing targeted recalls (`POST /api/v1/recall/recalls`). |

---

## 3. Backend Blocking Issues

**NONE.** The backend Base Model is 100% frozen, fully verified, and operational in both `MOCK_MODE=true` and `MOCK_MODE=false`. Frontend development can proceed immediately without backend blockers.
