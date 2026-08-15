import uuid
import pytest
from datetime import datetime
from app.models.identity import Organization, User

@pytest.mark.asyncio
async def test_event_syncing(client, db_session):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed dependencies
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Event Test Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    user_id = uuid.uuid4()
    user = User(user_id=user_id, organization_id=org_id, role_id="OPERATOR", auth_subject="event-test-sub")
    db_session.add(user)
    await db_session.flush()

    event_payload = {
        "type": "BATCH_REGISTERED",
        "actor_org_id": str(org_id),
        "actor_user_id": str(user_id),
        "target_id": "BATCH-EVENT-01",
        "state_before": "None",
        "state_after": "REGISTERED",
        "fabric_tx_id": "tx-blockchain-abc",
        "timestamp": datetime.utcnow().isoformat()
    }

    # Verify event syncing
    res = await client.post("/internal/events", json=event_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["fabric_tx_id"] == "tx-blockchain-abc"

    # Verify Scan logging (not state-changing)
    scan_payload = {
        "entity_id": "BATCH-EVENT-01",
        "actor_org_id": str(org_id),
        "location": "Warehouse-Z",
        "result": "VERIFIED"
    }
    res = await client.post("/internal/events/scans", json=scan_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["result"] == "VERIFIED"
