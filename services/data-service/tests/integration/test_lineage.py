import uuid
import pytest
from app.models.identity import Organization
from app.models.product import Product

@pytest.mark.asyncio
async def test_lineage_graph(client, db_session):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed dependencies
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Lineage Test Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Wheat Flour", product_type="GRAIN")
    db_session.add(product)
    await db_session.flush()

    # Create batches
    batch_payload_1 = {
        "batch_id": "BATCH-PARENT-01",
        "product_id": str(product_id),
        "quantity": 200.0,
        "state": "REGISTERED",
        "owner_org_id": str(org_id)
    }
    await client.post("/internal/batches", json=batch_payload_1, headers=headers)

    batch_payload_2 = {
        "batch_id": "BATCH-CHILD-01",
        "product_id": str(product_id),
        "quantity": 100.0,
        "state": "REGISTERED",
        "owner_org_id": str(org_id)
    }
    await client.post("/internal/batches", json=batch_payload_2, headers=headers)

    # Link parent -> child
    edge_payload = {
        "parent_batch_id": "BATCH-PARENT-01",
        "child_batch_id": "BATCH-CHILD-01",
        "relation_type": "TRANSFORMATION",
        "quantity": 100.00
    }
    res = await client.post("/internal/lineage/edges", json=edge_payload, headers=headers)
    assert res.status_code == 201

    # Query parent lineage (should show child in downstream)
    res = await client.get("/internal/lineage/BATCH-PARENT-01", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "BATCH-CHILD-01" in data["data"]["downstream"]

    # Query child lineage (should show parent in upstream)
    res = await client.get("/internal/lineage/BATCH-CHILD-01", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "BATCH-PARENT-01" in data["data"]["upstream"]
