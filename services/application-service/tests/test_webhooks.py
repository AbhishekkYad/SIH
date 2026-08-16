import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, AsyncMock
from app.config import settings
import uuid
import datetime

client = TestClient(app)

@pytest.fixture
def valid_webhook_headers():
    return {
        "Authorization": f"Bearer {settings.INTERNAL_API_KEY}"
    }

def test_webhook_batch_event_success(valid_webhook_headers):
    # Real payload structure from TraceabilityContract.ts Batch
    payload = {
        "transaction_id": "tx-12345",
        "block_number": 12,
        "event_name": "BATCH_REGISTERED",
        "payload": {
            "docType": "batch",
            "batch_id": "batch-8888",
            "product_id": "product-9999",
            "state": "REGISTERED",
            "current_custodian": "Org1MSP",
            "parent_refs": [],
            "created_at": "2026-08-16T00:20:30.399Z",
            "updated_at": "2026-08-16T00:20:30.399Z"
        },
        "emitted_at": "2026-08-16T00:20:31.000Z"
    }

    with patch("app.api.webhooks.get_data_client") as mock_get_client:
        mock_client = AsyncMock()
        # Ensure D1 mock save_event returns success
        mock_client.save_event.return_value = {"success": True}
        mock_get_client.return_value = mock_client

        response = client.post("/api/internal/webhooks/fabric", json=payload, headers=valid_webhook_headers)
        
        assert response.status_code == 200
        
        # Verify exactly what was passed to D1 save_event
        mock_client.save_event.assert_called_once()
        saved_event = mock_client.save_event.call_args[0][0]
        
        # target_id must be extracted successfully from batch_id, NOT UNKNOWN_TARGET
        assert saved_event["target_id"] == "batch-8888"
        assert saved_event["state_after"] == "REGISTERED"
        assert saved_event["fabric_tx_id"] == "tx-12345"
        assert saved_event["type"] == "BATCH_REGISTERED"
        # Verify the System User identity is used
        assert saved_event["actor_org_id"] == "00000000-0000-0000-0000-000000000000"
        assert saved_event["actor_user_id"] == "00000000-0000-0000-0000-000000000000"

def test_webhook_missing_target_id(valid_webhook_headers):
    # Payload lacking any recognizable target identifier
    payload = {
        "transaction_id": "tx-99999",
        "block_number": 13,
        "event_name": "UNKNOWN_EVENT",
        "payload": {
            "some_other_field": "data"
        },
        "emitted_at": "2026-08-16T00:25:31.000Z"
    }

    response = client.post("/api/internal/webhooks/fabric", json=payload, headers=valid_webhook_headers)
    
    # Must explicitly fail, NOT fall back to UNKNOWN_TARGET
    assert response.status_code == 400
    assert "Could not derive target_id" in response.json()["detail"]
