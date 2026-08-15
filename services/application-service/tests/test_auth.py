import pytest


@pytest.mark.asyncio
async def test_login_and_get_me(async_client):
    login_payload = {
        "username": "john_producer",
        "password": "password123",
        "role": "producer",
        "org_id": "org-citrus-farms"
    }
    response = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["role"] == "producer"
    
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = await async_client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user_id"] == "usr-john_producer"
    assert me_data["role"] == "producer"
