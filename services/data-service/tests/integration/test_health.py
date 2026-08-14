import pytest

@pytest.mark.asyncio
async def test_health_check_endpoint(client):
    """
    Verifies that the /health check endpoint returns a basic 200 OK.
    """
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "data-service"


@pytest.mark.asyncio
async def test_readiness_check_endpoint(client):
    """
    Verifies that the /ready endpoint returns status check updates for
    database, redis, and IPFS infrastructure.
    """
    res = await client.get("/ready")
    assert res.status_code in (200, 503)
    data = res.json()
    assert "components" in data
    assert "database" in data["components"]
    assert "redis" in data["components"]
    assert "ipfs" in data["components"]
