import uuid
import pytest

@pytest.mark.asyncio
async def test_product_lifecycle(client):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}
    product_id = str(uuid.uuid4())
    payload = {
        "product_id": product_id,
        "name": "Raw Organic Milk",
        "product_type": "DAIRY",
        "category": "Raw Milk"
    }

    # Verify unauthorized missing API Key
    res = await client.post("/internal/products", json=payload)
    assert res.status_code == 401

    # Verify successful creation
    res = await client.post("/internal/products", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["name"] == "Raw Organic Milk"

    # Verify duplicate prevention
    res = await client.post("/internal/products", json=payload, headers=headers)
    assert res.status_code == 400

    # Verify GET lookup
    res = await client.get(f"/internal/products/{product_id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["product_id"] == product_id
