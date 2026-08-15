import uuid
import pytest
from datetime import datetime
from unittest.mock import patch
from redis.exceptions import RedisError

from app.models.identity import Organization, User
from app.models.product import Product
from app.models.batch import Batch
from app.models.event import Event
from app.redis.client import redis_cache
from app.ipfs.client import ipfs_client

@pytest.mark.asyncio
async def test_redis_failure_shielding(client, db_session, monkeypatch):
    """
    Simulates a complete Redis connection failure.
    Verifies that the GET endpoint still works by falling back to PostgreSQL,
    returning a 200 OK without propagating any Redis exceptions.
    """
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed org, product, and batch
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Redis Resiliency Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Milk", product_type="DAIRY")
    db_session.add(product)
    await db_session.flush()

    batch_id = "BATCH-REDIS-FAIL"
    batch = Batch(batch_id=batch_id, product_id=product_id, quantity=10.0, state="AVAILABLE", owner_org_id=org_id)
    db_session.add(batch)
    await db_session.flush()

    # Force Redis mock client to raise RedisError on calls
    async def mock_fail_get(*args, **kwargs):
        raise RedisError("Redis connection timed out.")

    async def mock_fail_set_json(*args, **kwargs):
        raise RedisError("Redis connection timed out.")

    monkeypatch.setattr(redis_cache, "get_json", mock_fail_get)
    monkeypatch.setattr(redis_cache, "set_json", mock_fail_set_json)

    # Perform request: should NOT throw 500 error
    res = await client.get(f"/internal/batches/{batch_id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["batch_id"] == batch_id


@pytest.mark.asyncio
async def test_ipfs_failure_propagation(client, db_session, monkeypatch):
    """
    Simulates an IPFS connection failure.
    Verifies that file uploads return a strict 503 Service Unavailable error
    instead of silent success fallbacks.
    """
    # Seed org
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="IPFS Resiliency Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    await db_session.flush()

    # Mock IPFS add_file to raise a network connection error
    async def mock_fail_add_file(*args, **kwargs):
        raise Exception("IPFS Kubo daemon connection refused on port 5001.")

    monkeypatch.setattr(ipfs_client, "add_file", mock_fail_add_file)

    file_content = b"sample pdf report bytes"
    files = {"file": ("report.pdf", file_content, "application/pdf")}
    custom_headers = {
        "X-Internal-API-Key": "sih_super_secret_internal_key_2026",
        "X-Owner-Org-Id": str(org_id),
        "X-Evidence-Type": "LAB_REPORT",
        "X-Access-Class": "RESTRICTED",
        "X-Linked-Entity-Type": "BATCH",
        "X-Linked-Entity-Id": "BATCH-001"
    }

    # Perform request: must fail with a 503 dependency error
    res = await client.post("/internal/evidence", files=files, headers=custom_headers)
    assert res.status_code == 503
    data = res.json()
    assert "IPFS decentralized storage network is unreachable" in data["detail"]


@pytest.mark.asyncio
async def test_event_sync_idempotency(client, db_session):
    """
    Verifies that event synchronization with duplicate fabric_tx_id is idempotent.
    The second write request should return successfully without creating duplicate DB entries.
    """
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Seed dependencies
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Sync Idempotency Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    
    user_id = uuid.uuid4()
    user = User(user_id=user_id, organization_id=org_id, role_id="OPERATOR", auth_subject="sync-user-sub")
    db_session.add(user)
    await db_session.flush()

    # Single event payload
    event_payload = {
        "type": "BATCH_REGISTERED",
        "actor_org_id": str(org_id),
        "actor_user_id": str(user_id),
        "target_id": "BATCH-SYNC-01",
        "state_before": "None",
        "state_after": "REGISTERED",
        "fabric_tx_id": "duplicate-tx-id-100",
        "timestamp": datetime.utcnow().isoformat()
    }

    # Synchronize event first time
    res = await client.post("/internal/events", json=event_payload, headers=headers)
    assert res.status_code == 201
    
    # Synchronize event second time (duplicate tx)
    res2 = await client.post("/internal/events", json=event_payload, headers=headers)
    assert res2.status_code == 201

    # Verify that only one event row exists in the database
    from sqlalchemy.future import select
    result = await db_session.execute(
        select(Event).where(Event.fabric_tx_id == "duplicate-tx-id-100")
    )
    events_count = len(result.scalars().all())
    assert events_count == 1
