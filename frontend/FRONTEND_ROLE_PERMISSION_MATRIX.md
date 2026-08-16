# SIH 2026 — FRONTEND ROLE & PERMISSION MATRIX

## 1. Role Definitions

The system supports 8 recognized actor roles:

1. `consumer`: End consumer scanning product QRs & filing feedback.
2. `farmer`: Raw agricultural material producer.
3. `supplier`: Ingredient / feedstock supplier.
4. `producer`: Primary agricultural batch creator (e.g., Green Valley Citrus).
5. `processor`: Transformation & processing facility (e.g., FreshHarvest).
6. `transporter`: Logistics & transit operator (e.g., FastLogistics).
7. `retailer`: Final point-of-sale retailer (e.g., FreshMart).
8. `regulator`: Food safety authority / auditor.
9. `admin`: System administrator (unrestricted access).

---

## 2. Route Protection Matrix

| Page / Route | Authentication Required? | Allowed Roles | UI Action Permitted |
| :--- | :--- | :--- | :--- |
| `/` | Public | All (including anonymous) | View landing page |
| `/wetrack` | Public | All (including anonymous) | Search QR reference |
| `/one-food` | Public | All (including anonymous) | View trace history, check authenticity, submit feedback |
| `/login` | Public | All | Submit credentials |
| `/dashboard` | Authenticated | All authenticated roles | View supply chain KPIs & active batches |
| `/products` | Authenticated | `producer`, `processor`, `manufacturer`, `admin` | Create food product definitions |
| `/batches` | Authenticated | `farmer`, `supplier`, `producer`, `processor`, `manufacturer`, `admin` | Create new batches |
| `/batches/[id]` | Authenticated | All authenticated roles | View details, validate (if allowed role), transfer custody (if allowed role) |
| `/evidence` | Authenticated | All authenticated roles | Upload lab evidence / view CIDs |
| `/admin/incidents` | Authenticated | `manufacturer`, `regulator`, `admin` | View & investigate consumer complaints |
| `/admin/risk` | Authenticated | `manufacturer`, `regulator`, `admin` | Execute Risk Propagator |
| `/admin/recalls` | Authenticated | `manufacturer`, `regulator`, `admin` | Issue Batch Block or Targeted Recall |
| `/admin/audit` | Authenticated | `regulator`, `admin` | View immutable audit trail |
