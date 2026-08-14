import uuid
import pytest

@pytest.mark.asyncio
async def test_evidence_handling(client, db_session):
    # Seed org
    from app.models.identity import Organization
    org_id = uuid.uuid4()
    org = Organization(org_id=org_id, name="Evidence Test Org", type="MANUFACTURER", fabric_msp_id="Org1MSP")
    db_session.add(org)
    await db_session.flush()

    file_content = b"fake binary file representing lab report content"
    files = {"file": ("report.pdf", file_content, "application/pdf")}
    custom_headers = {
        "X-Internal-API-Key": "sih_super_secret_internal_key_2026",
        "X-Owner-Org-Id": str(org_id),
        "X-Evidence-Type": "LAB_REPORT",
        "X-Access-Class": "RESTRICTED",
        "X-Linked-Entity-Type": "BATCH",
        "X-Linked-Entity-Id": "BATCH-001"
    }
    
    # Test file upload
    res = await client.post("/internal/evidence", files=files, headers=custom_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    cid = data["data"]["cid"]
    assert cid.startswith("Qm")

    # Test file retrieval
    headers = {"X-Internal-API-Key": "sih_super_secret_internal_key_2026"}
    res = await client.get(f"/internal/evidence/{cid}", headers=headers)
    assert res.status_code == 200
    assert res.content == file_content
