import pytest


@pytest.mark.asyncio
async def test_evidence_dashboard_audit_endpoints(async_client, auth_headers, admin_headers):
    # 1. Test Supply Chain Overview Dashboard
    ov_res = await async_client.get("/api/v1/dashboard/supply-chain-overview", headers=auth_headers)
    assert ov_res.status_code == 200
    ov_data = ov_res.json()
    assert ov_data["overview_status"] == "ACTIVE"
    assert "metrics" in ov_data

    # 2. Test Batch Dashboard
    b_dash_res = await async_client.get("/api/v1/dashboard/batches", headers=auth_headers)
    assert b_dash_res.status_code == 200
    assert isinstance(b_dash_res.json(), list)

    # 3. Test Audit Trail
    audit_res = await async_client.get("/api/v1/audit/trail", headers=admin_headers)
    assert audit_res.status_code == 200
    assert isinstance(audit_res.json(), list)
