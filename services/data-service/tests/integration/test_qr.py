import uuid
import pytest
from app.models.identity import Organization
from app.models.product import Product
from app.models.batch import Batch
from app.models.unit import Unit

@pytest.mark.asyncio
async def test_qr_lifecycle(client, db_session):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed dependencies
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="QR Test Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Milk Carton", product_type="DAIRY")
    db_session.add(product)
    await db_session.flush()

    batch_id = "BATCH-QR-001"
    batch = Batch(batch_id=batch_id, product_id=product_id, quantity=100.0, state="AVAILABLE", owner_org_id=org_id)
    db_session.add(batch)
    await db_session.flush()

    unit_id = "UNIT-QR-001"
    unit = Unit(unit_id=unit_id, batch_id=batch_id, serial_reference="SN-QR-001", state="AVAILABLE")
    db_session.add(unit)
    await db_session.flush()

    qr_payload = {
        "public_reference": "https://trace.example/p/REF-12345",
        "credential_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "unit_id": unit_id,
        "credential_status": "ACTIVE",
        "binding_metadata": {"issuer": "SihAuthority"}
    }

    # Verify registration
    res = await client.post("/internal/qr", json=qr_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["public_reference"] == "https://trace.example/p/REF-12345"

    # Verify resolution (returns complete nested structure)
    res = await client.get("/internal/qr/https:%2F%2Ftrace.example%2Fp%2FREF-12345", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["credential"]["unit_id"] == unit_id
    assert data["data"]["unit"]["serial_reference"] == "SN-QR-001"
    assert data["data"]["batch"]["batch_id"] == batch_id
    assert data["data"]["product"]["name"] == "Milk Carton"
