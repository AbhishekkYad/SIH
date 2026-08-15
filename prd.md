# Product Requirements Document (PRD)
## Food Traceability + Authenticity + Consumer Accountability + Risk Response Platform

### 1. Executive Summary
The platform is a food traceability and safety system creating a trusted digital journey for food products from source to consumer. It tracks batch and unit lineage so that incidents can be traced backwards (to sources) and forwards (to affected products/locations). It incorporates a consumer-facing outer QR for traceability, a concealed inner credential for authenticity, and a consumer-driven feedback/accountability layer for real-time risk signal detection.

### 2. Product Goals & MVP Scope (Base Model)
**Goals**:
- End-to-end product/batch traceability.
- Trusted multi-organization event history.
- Batch and unit lineage tracking.
- Consumer traceability + physical authenticity check.
- Bidirectional risk propagation.
- Consumer feedback → accountability → escalation.
- Targeted recall and corrective-action support.

**MVP / Base Model Scope**:
- Organizations, roles, and authentication.
- Product, batch, and unit identity.
- Parent-child lineage and lifecycle states.
- Fabric + chaincode for critical rules/events.
- PostgreSQL operational/lineage database.
- Outer QR traceability.
- Supply-chain event recording.
- Risk Propagator version 1.
- Consumer incident/feedback reporting.
- Accountability scoring + configurable escalation thresholds.
- Batch-level complaint pattern detection.
- Basic business and recall dashboards.

### 3. Stakeholders & Roles
1. **Farmer / Supplier**: Provide/register source material.
2. **Producer / Processor**: Validate material, transform batches.
3. **Manufacturer**: Create final batches/units, perform blocking.
4. **Transporter**: Record transport-related events.
5. **Retailer**: Receive inventory, associate with sales.
6. **Consumer**: Scan QR, verify authenticity, submit feedback.
7. **Manufacturer/Brand Owner**: Monitor dashboard, analyze complaints/scans.
8. **Regulator**: Review incidents, recall scope, evidence.
9. **Platform Admin**: Manage organizations, roles, system health.

### 4. Functional Requirements
- **FR-01: Organization & Identity Management**: Maintain participants, RBAC, permissioned visibility.
- **FR-02: Product/Batch/Unit Identity**: Unique digital identities. QR references identity.
- **FR-03: Supply-Chain Event Recording**: Append-only trusted business events. **CRITICAL RULE**: A QR scan is NOT a state-changing business event. Every scan is recorded as an auditable interaction. Actual state changes (like custody transfer) require a separate authorized business transaction.
- **FR-04: Product Transformation & Lineage**: Parent-child lineage for backward/forward traversal.
- **FR-05: Outer QR Traceability**: Visible QR scanning for journey history.
- **FR-06: Inner Credential / Authenticity Layer**: Second verification for physical authenticity.
- **FR-07: Consumer Feedback**: Report issues with category, evidence, linked to unit.
- **FR-08/09: Accountability & Pattern Detection**: Initial accountability to nearest layer, aggregate similar complaints, escalate based on threshold.
- **FR-10: Risk Propagator**: Bidirectional graph traversal to find affected scope.
- **FR-11: Recall & Corrective Action**: Block/recall states for targeted scopes.
- **FR-12: Evidence Management**: Off-chain evidence in IPFS, referenced on-chain.
- **FR-13: Dashboards**: Centralized views for supply-chain and consumer intelligence.

### 5. Key Risks & Mitigations
- **Copied Outer QR**: Addressed by Inner Tamper-Evident Credential.
- **False Consumer Complaints**: Mitigated by pattern detection, thresholds, and verification workflows.
- **Blockchain Weight**: Keep data in PostgreSQL; evidence in IPFS; chaincode only for critical state validation.
