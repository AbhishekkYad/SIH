import asyncio
import uuid
import logging
from sqlalchemy.future import select

from app.database import AsyncSessionLocal, engine
from app.models.identity import Organization
from app.models.product import Product
from app.models.batch import Batch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sih.seed")

async def seed_data():
    """
    Seeds baseline database tables with agreed SIH 2026 demo organizations,
    the first product, and the first batch.
    """
    logger.info("Starting database seeding process...")
    
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # 1. Seed Organizations
            demo_orgs = [
                {
                    "org_id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
                    "name": "Demo Manufacturer Org",
                    "type": "MANUFACTURER",
                    "fabric_msp_id": "Org1MSP",
                    "status": "ACTIVE"
                },
                {
                    "org_id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
                    "name": "Demo Carrier Org",
                    "type": "CARRIER",
                    "fabric_msp_id": "Org2MSP",
                    "status": "ACTIVE"
                },
                {
                    "org_id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
                    "name": "Demo Retailer Org",
                    "type": "RETAILER",
                    "fabric_msp_id": "Org3MSP",
                    "status": "ACTIVE"
                }
            ]

            for org_data in demo_orgs:
                # Check duplicate
                existing = await session.execute(
                    select(Organization).where(Organization.org_id == org_data["org_id"])
                )
                if not existing.scalar_one_or_none():
                    org = Organization(**org_data)
                    session.add(org)
                    logger.info(f"Seeded Organization: {org_data['name']} ({org_data['fabric_msp_id']})")
                else:
                    logger.info(f"Organization '{org_data['name']}' already exists. Skipping.")

            # 2. Seed First Product (Organic Dairy Milk)
            product_id = uuid.UUID("3088f76e-c8b4-41a2-ba93-b2aa432f01be")
            existing_prod = await session.execute(
                select(Product).where(Product.product_id == product_id)
            )
            if not existing_prod.scalar_one_or_none():
                product = Product(
                    product_id=product_id,
                    name="Organic Dairy Milk",
                    product_type="DAIRY",
                    category="Beverage"
                )
                session.add(product)
                logger.info(f"Seeded Product: Organic Dairy Milk ({product_id})")
            else:
                logger.info("Product 'Organic Dairy Milk' already exists. Skipping.")

            # 3. Seed First Batch (BATCH-001) linked to the Product
            batch_id = "BATCH-001"
            existing_batch = await session.execute(
                select(Batch).where(Batch.batch_id == batch_id)
            )
            if not existing_batch.scalar_one_or_none():
                batch = Batch(
                    batch_id=batch_id,
                    product_id=product_id,
                    parent_metadata={"origin_farm": "GreenValley Organic Farm", "milking_date": "2026-08-15"},
                    quantity=1000.00,
                    state="REGISTERED",
                    owner_org_id=uuid.UUID("11111111-1111-1111-1111-111111111111")
                )
                session.add(batch)
                logger.info(f"Seeded Batch: {batch_id} (State: REGISTERED)")
            else:
                logger.info(f"Batch '{batch_id}' already exists. Skipping.")

    logger.info("Database seeding complete.")

if __name__ == "__main__":
    # Run async seeding main loop
    asyncio.run(seed_data())
