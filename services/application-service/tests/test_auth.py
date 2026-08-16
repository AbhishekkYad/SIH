import pytest


@pytest.mark.asyncio
async def test_auth_login(async_client):
    from app.demo.demo_state import ORG_GREEN_VALLEY_ID
    payload = {
        "username": "testuser",
        "password": "password",
        "role": "producer",
        "org_id": ORG_GREEN_VALLEY_ID
    }
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["role"] == "producer"
    
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user_id"] == "usr-testuser"
    assert me_data["role"] == "producer"
