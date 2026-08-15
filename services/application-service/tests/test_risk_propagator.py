import pytest


@pytest.mark.asyncio
async def test_risk_propagation_and_recall(async_client, admin_headers):
    # Propagate Risk
    risk_payload = {
        "source_batch_id": "batch-raw-101",
        "direction": "BOTH"
    }
    risk_res = await async_client.post("/api/v1/risk/propagate", json=risk_payload, headers=admin_headers)
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["source_batch_id"] == "batch-raw-101"
    assert "affected_organizations" in risk_data

    # Block Batch
    block_res = await async_client.post("/api/v1/recall/block", json={"batch_id": "batch-raw-101", "reason": "Contamination hazard"}, headers=admin_headers)
    assert block_res.status_code == 200
    assert block_res.json()["new_state"] == "BLOCKED"

    # Issue Recall Action
    recall_payload = {
        "affected_batch_ids": ["batch-raw-101"],
        "reason": "Class I recall"
    }
    rcl_res = await async_client.post("/api/v1/recall/recalls", json=recall_payload, headers=admin_headers)
    assert rcl_res.status_code == 201
    rcl_data = rcl_res.json()
    assert rcl_data["status"] == "RECALL_ISSUED"
    assert rcl_data["blockchain_tx_id"] is not None
