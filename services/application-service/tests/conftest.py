import pytest
import pytest_asyncio
import os
os.environ["MOCK_MODE"] = "true"

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.auth import create_access_token


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def auth_headers():
    from app.demo.demo_state import ORG_GREEN_VALLEY_ID
    token = create_access_token(subject="usr-test-producer", role="producer", org_id=ORG_GREEN_VALLEY_ID)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    from app.demo.demo_state import ORG_FSA_ID
    token = create_access_token(subject="usr-admin-user", role="admin", org_id=ORG_FSA_ID)
    return {"Authorization": f"Bearer {token}"}
