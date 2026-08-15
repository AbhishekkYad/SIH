import uuid
import pytest

@pytest.mark.asyncio
async def test_identity_organization_endpoints(client):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Test unauthorized access
    res = await client.post("/internal/identity/organizations", json={})
    assert res.status_code == 401

    org_id = str(uuid.uuid4())
    org_payload = {
        "org_id": org_id,
        "name": "Cooperative Citrus Farms",
        "type": "PRODUCER",
        "fabric_msp_id": "OrgCitrusMSP"
    }

    # Test successful creation
    res = await client.post("/internal/identity/organizations", json=org_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["org_id"] == org_id
    assert data["data"]["status"] == "ACTIVE"

    # Test duplicate name prevention
    org_payload2 = {
        "name": "Cooperative Citrus Farms",
        "type": "PRODUCER",
        "fabric_msp_id": "OrgCitrusMSP2"
    }
    res = await client.post("/internal/identity/organizations", json=org_payload2, headers=headers)
    assert res.status_code == 400

    # Test duplicate ID prevention
    org_payload3 = {
        "org_id": org_id,
        "name": "Another Citrus Farm",
        "type": "PRODUCER",
        "fabric_msp_id": "OrgCitrusMSP3"
    }
    res = await client.post("/internal/identity/organizations", json=org_payload3, headers=headers)
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_role_permission_endpoint(client):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    payload = {
        "role_id": "SUPER_ADMIN",
        "permission_code": "PERM_CRITICAL_RECALL"
    }

    # Test successful mapping
    res = await client.post("/internal/identity/roles/permissions", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["role_id"] == "SUPER_ADMIN"
    assert data["data"]["permission_code"] == "PERM_CRITICAL_RECALL"

    # Test duplicate mapping is idempotent
    res = await client.post("/internal/identity/roles/permissions", json=payload, headers=headers)
    assert res.status_code == 201

@pytest.mark.asyncio
async def test_user_role_assignment_endpoint(client):
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}

    # Register an organization first
    org_id = str(uuid.uuid4())
    org_payload = {
        "org_id": org_id,
        "name": "User Test Organization",
        "type": "PRODUCER",
        "fabric_msp_id": "UserTestOrgMSP"
    }
    res = await client.post("/internal/identity/organizations", json=org_payload, headers=headers)
    assert res.status_code == 201

    # Test user assignment with non-existent org_id
    bad_user_payload = {
        "organization_id": str(uuid.uuid4()),
        "role_id": "OPERATOR",
        "auth_subject": "google-oauth2|12345678"
    }
    res = await client.post("/internal/identity/users", json=bad_user_payload, headers=headers)
    assert res.status_code == 400

    user_id = str(uuid.uuid4())
    user_payload = {
        "user_id": user_id,
        "organization_id": org_id,
        "role_id": "OPERATOR",
        "auth_subject": "google-oauth2|12345678"
    }

    # Test successful user mapping
    res = await client.post("/internal/identity/users", json=user_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["user_id"] == user_id
    assert data["data"]["role_id"] == "OPERATOR"
    assert data["data"]["status"] == "ACTIVE"

    # Test duplicate ID check
    dup_id_payload = {
        "user_id": user_id,
        "organization_id": org_id,
        "role_id": "MANAGER",
        "auth_subject": "google-oauth2|99999999"
    }
    res = await client.post("/internal/identity/users", json=dup_id_payload, headers=headers)
    assert res.status_code == 400

    # Test duplicate subject updates existing mapping (idempotent role reassignment)
    reassign_payload = {
        "organization_id": org_id,
        "role_id": "MANAGER",
        "auth_subject": "google-oauth2|12345678"
    }
    res = await client.post("/internal/identity/users", json=reassign_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["role_id"] == "MANAGER"
