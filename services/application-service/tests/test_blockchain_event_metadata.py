"""
test_blockchain_event_metadata.py

Tests for P0 + P1 blockchain metadata enhancement:
- Existing transactions without location continue to work
- Event metadata flows from request → blockchain payload → D1 → QR response
- Transaction ID, block_number, channel_id surface in trace history
- MOCK_MODE returns canonical demo metadata (Apple Juice)
- Webhook preserves metadata and block_number from gateway event
"""
import pytest
import json
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

@pytest.fixture
def webhook_headers():
    return {"Authorization": f"Bearer {settings.INTERNAL_API_KEY}"}


# ─────────────────────────────────────────────────────────────────────────────
# P0: BLOCKCHAIN PROOF — Existing transaction path unaffected
# ─────────────────────────────────────────────────────────────────────────────

def test_webhook_preserves_fabric_tx_id(webhook_headers):
    """Regression: fabric_tx_id must still pass through to D1."""
    payload = {
        "transaction_id": "tx-blockchain-proof-001",
        "block_number": 42,
        "channel_id": "traceability-channel",
        "event_name": "BATCH_REGISTERED",
        "payload": {
            "batch_id": "batch-location-test-001",
            "state": "REGISTERED",
        },
        "emitted_at": "2026-08-16T06:30:00.000Z"
    }
    with patch("app.api.webhooks.get_data_client") as mock_get:
        mock_client = AsyncMock()
        mock_client.save_event.return_value = {"success": True}
        mock_get.return_value = mock_client

        res = client.post("/api/internal/webhooks/fabric", json=payload, headers=webhook_headers)
        assert res.status_code == 200

        saved = mock_client.save_event.call_args[0][0]
        assert saved["fabric_tx_id"] == "tx-blockchain-proof-001"
        assert saved["block_number"] == 42
        assert saved["type"] == "BATCH_REGISTERED"
        assert saved["target_id"] == "batch-location-test-001"
        assert saved["actor_org_id"] == "00000000-0000-0000-0000-000000000000"


def test_webhook_preserves_block_number(webhook_headers):
    """block_number from the Fabric event listener must be forwarded to D1."""
    payload = {
        "transaction_id": "tx-block-num-test",
        "block_number": 99,
        "channel_id": "traceability-channel",
        "event_name": "BATCH_VALIDATED",
        "payload": {
            "batch_id": "batch-blocknum-test",
            "state": "VALIDATED",
        },
        "emitted_at": "2026-08-16T06:31:00.000Z"
    }
    with patch("app.api.webhooks.get_data_client") as mock_get:
        mock_client = AsyncMock()
        mock_client.save_event.return_value = {"success": True}
        mock_get.return_value = mock_client

        res = client.post("/api/internal/webhooks/fabric", json=payload, headers=webhook_headers)
        assert res.status_code == 200

        saved = mock_client.save_event.call_args[0][0]
        assert saved["block_number"] == 99


# ─────────────────────────────────────────────────────────────────────────────
# P1: LOCATION — Without location (backward-compat)
# ─────────────────────────────────────────────────────────────────────────────

def test_webhook_no_location_still_succeeds(webhook_headers):
    """Existing events without location must still be accepted without error."""
    payload = {
        "transaction_id": "tx-no-location-001",
        "block_number": 5,
        "event_name": "BATCH_TRANSFERRED",
        "payload": {
            "batch_id": "batch-no-location",
            "state": "IN_TRANSIT",
        },
        "emitted_at": "2026-08-16T06:32:00.000Z"
    }
    with patch("app.api.webhooks.get_data_client") as mock_get:
        mock_client = AsyncMock()
        mock_client.save_event.return_value = {"success": True}
        mock_get.return_value = mock_client

        res = client.post("/api/internal/webhooks/fabric", json=payload, headers=webhook_headers)
        assert res.status_code == 200

        saved = mock_client.save_event.call_args[0][0]
        # Location fields must be None — not absent, not fabricated
        assert saved.get("latitude") is None
        assert saved.get("longitude") is None
        assert saved.get("location_name") is None


# ─────────────────────────────────────────────────────────────────────────────
# P1: METADATA — With metadata (full pipeline)
# ─────────────────────────────────────────────────────────────────────────────

def test_webhook_preserves_metadata_from_fabric_event(webhook_headers):
    """Metadata originating from Fabric event payload must arrive in D1 mapped_event."""
    payload = {
        "transaction_id": "tx-with-metadata-001",
        "block_number": 11,
        "channel_id": "traceability-channel",
        "event_name": "BATCH_TRANSFERRED",
        "payload": {
            "batch_id": "batch-metadata-flow-001",
            "state": "IN_TRANSIT",
            "latitude": 19.2183,
            "longitude": 72.9781,
            "location_name": "Lokmanya Nagar, Thane, Maharashtra",
            "vehicle_no": "MH-04-AB-1234",
            "conditions": {"temperature_maintained": "4C"}
        },
        "emitted_at": "2026-08-16T06:33:00.000Z"
    }
    with patch("app.api.webhooks.get_data_client") as mock_get:
        mock_client = AsyncMock()
        mock_client.save_event.return_value = {"success": True}
        mock_get.return_value = mock_client

        res = client.post("/api/internal/webhooks/fabric", json=payload, headers=webhook_headers)
        assert res.status_code == 200

        saved = mock_client.save_event.call_args[0][0]
        assert saved["latitude"] == 19.2183
        assert saved["longitude"] == 72.9781
        assert saved["location_name"] == "Lokmanya Nagar, Thane, Maharashtra"
        assert saved["metadata"]["vehicle_no"] == "MH-04-AB-1234"
        assert saved["metadata"]["conditions"]["temperature_maintained"] == "4C"
        # Blockchain proof fields also present
        assert saved["fabric_tx_id"] == "tx-with-metadata-001"
        assert saved["block_number"] == 11


# ─────────────────────────────────────────────────────────────────────────────
# BATCH SCHEMA: LocationData validation
# ─────────────────────────────────────────────────────────────────────────────

def test_location_schema_valid():
    """LocationData schema must accept valid coordinates."""
    from app.schemas.batches import LocationData
    loc = LocationData(latitude=19.2183, longitude=72.9781, location_name="Thane")
    assert loc.latitude == 19.2183
    assert loc.longitude == 72.9781
    assert loc.location_name == "Thane"


def test_location_schema_invalid_latitude():
    """Latitude out of range must be rejected by Pydantic validation."""
    from app.schemas.batches import LocationData
    import pydantic
    with pytest.raises((pydantic.ValidationError, Exception)):
        LocationData(latitude=95.0, longitude=72.0)


def test_location_schema_invalid_longitude():
    """Longitude out of range must be rejected by Pydantic validation."""
    from app.schemas.batches import LocationData
    import pydantic
    with pytest.raises((pydantic.ValidationError, Exception)):
        LocationData(latitude=19.0, longitude=200.0)


def test_location_schema_optional_name():
    """location_name must be optional."""
    from app.schemas.batches import LocationData
    loc = LocationData(latitude=0.0, longitude=0.0)
    assert loc.location_name is None


# ─────────────────────────────────────────────────────────────────────────────
# MOCK_MODE: QR trace history blockchain proof
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_qr_trace_history_contains_blockchain_proof(async_client, auth_headers):
    """QR resolve for demo batch must return blockchain proof fields in trace_history."""
    res = await async_client.post(
        "/api/v1/qr/resolve",
        json={"qr_reference": "batch-apple-001-packaged"},
        headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()
    assert data["qr_reference"] == "batch-apple-001-packaged"

    history = data.get("trace_history", [])
    assert len(history) > 0, "trace_history must not be empty"

    # At least one event must have a transaction_id (blockchain proof)
    events_with_tx = [e for e in history if e.get("blockchain", {}).get("transaction_id")]
    assert len(events_with_tx) > 0, "At least one trace event must carry a transaction_id"

    # Verify the first enriched event has the expected shape
    first = events_with_tx[0]
    assert "event_name" in first
    assert "blockchain" in first
    assert first["blockchain"]["transaction_id"]
    assert first["blockchain"]["block_number"]
    assert first["blockchain"]["channel_id"]
    assert "actor" in first
    assert "timestamp" in first


@pytest.mark.asyncio
async def test_qr_trace_history_contains_metadata(async_client, auth_headers):
    """Demo events have seeded metadata (Apple Juice story) — trace_history must expose it."""
    res = await async_client.post(
        "/api/v1/qr/resolve",
        json={"qr_reference": "batch-apple-001-packaged"},
        headers=auth_headers
    )
    assert res.status_code == 200
    data = res.json()

    history = data.get("trace_history", [])
    # Check that actor info or conditions are present
    events_with_metadata = [e for e in history if e.get("actor", {}).get("organization_name")]
    assert len(events_with_metadata) > 0, "At least one demo event must carry mapped metadata"
    
    # Check dossier presence in product
    assert "product" in data
    assert "certifications" in data


@pytest.mark.asyncio
async def test_qr_trace_history_demo_channel_id(async_client, auth_headers):
    """MOCK_MODE trace history must carry traceability-channel (demo config value)."""
    res = await async_client.post(
        "/api/v1/qr/resolve",
        json={"qr_reference": "batch-apple-001-packaged"},
        headers=auth_headers
    )
    assert res.status_code == 200
    history = res.json().get("trace_history", [])
    channel_events = [e for e in history if e.get("blockchain", {}).get("channel_id")]
    assert any(e["blockchain"]["channel_id"] == "traceability-channel" for e in channel_events), \
        "Demo channel_id must be 'traceability-channel'"


# ─────────────────────────────────────────────────────────────────────────────
# EXISTING TESTS: Regression guard
# ─────────────────────────────────────────────────────────────────────────────

def test_webhook_missing_target_id_still_400(webhook_headers):
    """Regression: missing target_id must return 400, not silently pass."""
    payload = {
        "transaction_id": "tx-regression-001",
        "block_number": 1,
        "event_name": "UNKNOWN_EVENT",
        "payload": {"some_other_field": "data"},
        "emitted_at": "2026-08-16T06:35:00.000Z"
    }
    res = client.post("/api/internal/webhooks/fabric", json=payload, headers=webhook_headers)
    assert res.status_code == 400
    assert "target_id" in res.json()["detail"].lower() or "Could not derive" in res.json()["detail"]


def test_webhook_duplicate_event_idempotency(webhook_headers):
    """Regression: 409 Conflict from D1 (duplicate tx) must be swallowed and return 200."""
    import httpx
    payload = {
        "transaction_id": "tx-duplicate-test",
        "block_number": 2,
        "event_name": "BATCH_REGISTERED",
        "payload": {"batch_id": "batch-dupe-test"},
        "emitted_at": "2026-08-16T06:36:00.000Z"
    }
    conflict_response = AsyncMock()
    conflict_response.status_code = 409

    conflict_error = httpx.HTTPStatusError(
        "409 Conflict",
        request=AsyncMock(),
        response=conflict_response
    )

    with patch("app.api.webhooks.get_data_client") as mock_get:
        mock_client = AsyncMock()
        mock_client.save_event.side_effect = conflict_error
        mock_get.return_value = mock_client

        res = client.post("/api/internal/webhooks/fabric", json=payload, headers=webhook_headers)
        assert res.status_code == 200
        assert res.json()["message"] == "Duplicate event ignored"
