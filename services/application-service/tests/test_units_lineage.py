import pytest


@pytest.mark.asyncio
async def test_units_and_lineage_endpoints(async_client, auth_headers, admin_headers):
    # 1. Create Unit from batch "batch-raw-101" (requires manufacturer, processor, or admin role)
    unit_payload = {
        "batch_id": "batch-raw-101",
        "serial_number": "SN-TEST-100223"
    }
    u_res = await async_client.post("/api/v1/units", json=unit_payload, headers=admin_headers)
    assert u_res.status_code == 201
    u_data = u_res.json()
    assert u_data["unit_id"].startswith("unit-")
    assert u_data["status"] == "AVAILABLE"
    
    # Get Unit
    unit_id = u_data["unit_id"]
    get_u_res = await async_client.get(f"/api/v1/units/{unit_id}", headers=auth_headers)
    assert get_u_res.status_code == 200
    assert get_u_res.json()["serial_number"] == "SN-TEST-100223"

    # 2. Query Lineage for "batch-raw-101"
    lin_res = await async_client.get("/api/v1/lineage/batch-raw-101", headers=auth_headers)
    assert lin_res.status_code == 200
    lin_data = lin_res.json()
    assert lin_data["target_batch_id"] == "batch-raw-101"
    assert "parents" in lin_data
    assert "children" in lin_data
