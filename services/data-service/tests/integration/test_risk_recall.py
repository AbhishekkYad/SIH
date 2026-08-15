import uuid
import pytest
from app.models.identity import Organization, User
from app.models.product import Product
from app.models.batch import Batch
from app.models.incident import Incident

@pytest.mark.asyncio
async def test_risk_recall_lifecycle(client, db_session):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed dependencies
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Risk Recall Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    user_id = uuid.uuid4()
    user = User(user_id=user_id, organization_id=org_id, role_id="OPERATOR", auth_subject="risk-recall-user")
    db_session.add(user)
    
    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Traceable Grain", product_type="GRAIN")
    db_session.add(product)
    await db_session.flush()

    batch_id = "BATCH-RISK-001"
    batch = Batch(batch_id=batch_id, product_id=product_id, quantity=100.0, state="AVAILABLE", owner_org_id=org_id)
    db_session.add(batch)
    await db_session.flush()

    incident_id = uuid.uuid4()
    incident = Incident(incident_id=incident_id, batch_id=batch_id, category="contamination", severity="Critical", source="CONSUMER")
    db_session.add(incident)
    await db_session.flush()

    # 1. Create Risk Scope Snapshot
    scope_payload = {
        "incident_id": str(incident_id),
        "scope_status": "POTENTIAL",
        "nodes": [
            {"entity_type": "BATCH", "entity_id": batch_id, "impact_status": "HIGH_PROBABILITY"}
        ]
    }
    res = await client.post("/internal/risk-recall/scopes", json=scope_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    scope_id = data["data"]["scope_id"]
    assert scope_id is not None

    # 2. Record a Recall Action bound to the scope
    recall_payload = {
        "incident_id": str(incident_id),
        "scope_id": scope_id,
        "action_type": "RECALL",
        "authorized_by": str(user_id)
    }
    res = await client.post("/internal/risk-recall/recalls", json=recall_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    recall_action_id = data["data"]["recall_action_id"]

    # 3. Update Recall Action status
    status_payload = {
        "status": "COMPLETED"
    }
    res = await client.post(f"/internal/risk-recall/recalls/{recall_action_id}/status", json=status_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["status"] == "COMPLETED"
