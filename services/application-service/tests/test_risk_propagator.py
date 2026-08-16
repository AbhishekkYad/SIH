import pytest


@pytest.mark.asyncio
async def test_risk_propagation_and_recall(async_client, admin_headers):
    # 1. Propagate Risk
    prop_payload = {
        "source_batch_id": "batch-orange-001-raw",
        "risk_type": "CONTAMINATION"
    }
    prop_res = await async_client.post("/api/v1/risk/propagate", json=prop_payload, headers=admin_headers)
    assert prop_res.status_code == 200
    risk_data = prop_res.json()
    assert risk_data["source_batch_id"] == "batch-orange-001-raw"
    assert "affected_child_batches" in risk_data

    # 2. Block Batch
    block_res = await async_client.post("/api/v1/recall/block", json={"batch_id": "batch-orange-001-packaged", "reason": "Contamination hazard"}, headers=admin_headers)
    assert block_res.status_code == 200

    # 3. Create Recall Action
    recall_payload = {
        "reason": "Safety concern",
        "affected_batch_ids": ["batch-orange-001-packaged"],
        "reason": "Class I recall"
    }
    rcl_res = await async_client.post("/api/v1/recall/recalls", json=recall_payload, headers=admin_headers)
    assert rcl_res.status_code == 201
    rcl_data = rcl_res.json()
    assert rcl_data["status"] == "RECALL_ISSUED"
    assert rcl_data["blockchain_tx_id"] is not None
