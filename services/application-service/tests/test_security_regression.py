import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_no_token_returns_401():
    response = client.post("/api/v1/products", json={
        "name": "Test Product",
        "sku": "SKU-TEST",
        "category": "RAW_MATERIAL"
    })
    assert response.status_code == 401

def test_invalid_token_returns_401():
    response = client.post("/api/v1/products", json={
        "name": "Test Product",
        "sku": "SKU-TEST",
        "category": "RAW_MATERIAL"
    }, headers={"Authorization": "Bearer INVALID_TOKEN"})
    assert response.status_code == 401

def test_consumer_role_cannot_create_product():
    # Login as consumer
    login_res = client.post("/api/v1/auth/login", json={
        "username": "consumer_user",
        "password": "password123",
        "role": "consumer",
        "org_id": None
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    
    response = client.post("/api/v1/products", json={
        "name": "Test Product",
        "sku": "SKU-TEST",
        "category": "RAW_MATERIAL"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403

def test_invalid_qr_fails_cleanly():
    # Consumer login
    login_res = client.post("/api/v1/auth/login", json={
        "username": "consumer_user",
        "password": "password123",
        "role": "consumer",
        "org_id": None
    })
    token = login_res.json()["access_token"]
    
    res = client.post("/api/v1/qr/resolve", json={
        "qr_reference": "INVALID-QR-NON-EXISTENT"
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert res.status_code == 404

def test_invalid_credential_returns_false_authenticity():
    # Consumer login
    login_res = client.post("/api/v1/auth/login", json={
        "username": "consumer_user",
        "password": "password123",
        "role": "consumer",
        "org_id": None
    })
    token = login_res.json()["access_token"]
    
    # We will test against a known valid batch in mock state (e.g. batch-apple-001-raw)
    res = client.post("/api/v1/qr/verify-credential", json={
        "inner_credential_code": "SHORT", # Length < 6 is invalid
        "unit_or_batch_id": "batch-apple-001-raw"
    }, headers={"Authorization": f"Bearer {token}"})
    
    assert res.status_code == 200
    data = res.json()
    assert data["authenticity"]["verified"] is False
    assert data["traceability"]["verified"] is True
