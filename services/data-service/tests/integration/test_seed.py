import uuid
import pytest
from sqlalchemy.future import select

from app.seed import seed_data
from app.models.identity import Organization
from app.models.product import Product
from app.models.batch import Batch

@pytest.mark.asyncio
async def test_database_seeding_script(db_session, monkeypatch):
    """
    Verifies that executing seed_data() successfully populates organizations,
    product, and batch tables correctly.
    """
    # Force seed_data to use our test session factory
    from app.database import AsyncSessionLocal
    
    # We can temporarily patch the SessionLocal context inside app.seed to use our test session
    # but since seed_data() creates its own SessionLocal, we can temporarily mock AsyncSessionLocal
    # inside app.seed.AsyncSessionLocal to return the transactional session (which keeps tables in-memory).
    # Since we want to check that the database writes work, we can run seed_data and assert counts.
    # To run it against the transactional test DB, we can mock AsyncSessionLocal in app.seed:
    class MockAsyncSessionLocal:
        def __init__(self, *args, **kwargs):
            pass
        async def __aenter__(self):
            return db_session
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    monkeypatch.setattr("app.seed.AsyncSessionLocal", MockAsyncSessionLocal)

    # Execute seed script
    await seed_data()

    # Verify Organizations were inserted
    res_orgs = await db_session.execute(select(Organization))
    orgs = res_orgs.scalars().all()
    assert len(orgs) == 3
    org_msp_ids = {org.fabric_msp_id for org in orgs}
    assert "Org1MSP" in org_msp_ids
    assert "Org2MSP" in org_msp_ids
    assert "Org3MSP" in org_msp_ids

    # Verify Product was inserted
    res_prod = await db_session.execute(select(Product).where(Product.product_id == uuid.UUID("3088f76e-c8b4-41a2-ba93-b2aa432f01be")))
    product = res_prod.scalar_one_or_none()
    assert product is not None
    assert product.name == "Organic Dairy Milk"

    # Verify Batch was inserted
    res_batch = await db_session.execute(select(Batch).where(Batch.batch_id == "BATCH-001"))
    batch = res_batch.scalar_one_or_none()
    assert batch is not None
    assert batch.state == "REGISTERED"
    assert batch.product_id == product.product_id
