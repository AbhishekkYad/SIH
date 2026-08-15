import uuid
import pytest
from app.models.identity import Organization
from app.models.product import Product
from app.models.batch import Batch

@pytest.mark.asyncio
async def test_unit_lifecycle(client, db_session):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed dependencies
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Unit Test Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Milk Carton", product_type="DAIRY")
    db_session.add(product)
    await db_session.flush()

    batch_id = "BATCH-UNIT-001"
    batch = Batch(batch_id=batch_id, product_id=product_id, quantity=500.0, state="AVAILABLE", owner_org_id=org_id)
    db_session.add(batch)
    await db_session.flush()

    unit_payload = {
        "unit_id": "UNIT-001",
        "batch_id": batch_id,
        "serial_reference": "SN-987654321",
        "state": "AVAILABLE"
    }

    # Verify creation
    res = await client.post("/internal/units", json=unit_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["unit_id"] == "UNIT-001"

    # Verify GET lookup
    res = await client.get("/internal/units/UNIT-001", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["serial_reference"] == "SN-987654321"
