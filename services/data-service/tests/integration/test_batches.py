import uuid
import pytest
from app.models.identity import Organization
from app.models.product import Product

@pytest.mark.asyncio
async def test_batch_lifecycle(client, db_session):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}
    
    # Seed org & product dependencies
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Batch Test Org", type="PRODUCER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Test Product", product_type="GRAIN")
    db_session.add(product)
    await db_session.flush()

    batch_payload = {
        "batch_id": "BATCH-TEST-001",
        "product_id": str(product_id),
        "parent_metadata": {"harvest_field": "North-3"},
        "quantity": 150.75,
        "state": "REGISTERED",
        "owner_org_id": str(org_id)
    }

    # Verify creation
    res = await client.post("/internal/batches", json=batch_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["batch_id"] == "BATCH-TEST-001"

    # Verify GET lookup
    res = await client.get("/internal/batches/BATCH-TEST-001", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["state"] == "REGISTERED"
