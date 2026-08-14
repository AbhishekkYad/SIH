import pytest
import pytest_asyncio
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
    token = create_access_token(subject="usr-test-producer", role="producer", org_id="org-citrus-farms")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    token = create_access_token(subject="usr-admin-user", role="admin", org_id="org-platform-admin")
    return {"Authorization": f"Bearer {token}"}
