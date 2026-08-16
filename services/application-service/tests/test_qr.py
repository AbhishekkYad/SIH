import pytest


@pytest.mark.asyncio
async def test_qr_resolution_and_non_state_mutating_scan(async_client, auth_headers):
    # Resolve pre-seeded batch "batch-orange-001-packaged"
    qr_payload = {"qr_reference": "batch-orange-001-packaged"}
    res = await async_client.post("/api/v1/qr/resolve", json=qr_payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["reference_id"] == "batch-orange-001-packaged"

    # Test Verify Credential
    cred_payload = {
        "inner_credential_code": "mock_hash_xyz",
        "qr_reference": "batch-orange-001-packaged",
        "unit_or_batch_id": "batch-orange-001-packaged"
    }
    verify_res = await async_client.post("/api/v1/qr/verify-credential", json=cred_payload, headers=auth_headers)
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["authenticity"]["verified"] is True
