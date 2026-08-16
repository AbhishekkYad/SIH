import pytest


@pytest.mark.asyncio
async def test_first_vertical_slice_product_to_batch_to_validate(async_client, auth_headers):
    # 1. Create Product
    product_payload = {
        "name": "Organic Apple Cider",
        "sku": "SKU-APC-1000ML",
        "category": "BEVERAGE",
        "specifications": {"volume": "1L", "organic": True}
    }
    p_res = await async_client.post("/api/v1/products", json=product_payload, headers=auth_headers)
    assert p_res.status_code == 201
    p_data = p_res.json()
    product_id = p_data["product_id"]
    assert isinstance(product_id, str)
    assert p_data["blockchain_tx_id"] is not None

    # 2. Create Batch
    batch_payload = {
        "product_id": product_id,
        "quantity": 1000.0,
        "unit_of_measure": "LITERS"
    }
    b_res = await async_client.post("/api/v1/batches", json=batch_payload, headers=auth_headers)
    assert b_res.status_code == 201
    b_data = b_res.json()
    batch_id = b_data["batch_id"]
    assert b_data["lifecycle_state"] == "REGISTERED"
    assert b_data["blockchain_tx_id"] is not None

    # 3. Validate Batch
    val_res = await async_client.post(f"/api/v1/batches/{batch_id}/validate", json={"notes": "Lab test passed"}, headers=auth_headers)
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["lifecycle_state"] == "VALIDATED"
    assert val_data["blockchain_tx_id"] is not None
