import pytest


@pytest.mark.asyncio
async def test_qr_resolution_and_non_state_mutating_scan(async_client, auth_headers):
    # Resolve pre-seeded batch "batch-raw-101"
    qr_payload = {"qr_reference": "batch-raw-101"}
    res = await async_client.post("/api/v1/qr/resolve", json=qr_payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["reference_id"] == "batch-raw-101"
    assert data["scan_recorded"] is True
    assert data["audit_tx_id"] is not None

    # Verify inner credential
    cred_payload = {
        "inner_credential_code": "TAMPER-PROOF-SECRET-123",
        "unit_or_batch_id": "batch-raw-101"
    }
    verify_res = await async_client.post("/api/v1/qr/verify-credential", json=cred_payload, headers=auth_headers)
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["is_authentic"] is True
