import asyncio
from sqlalchemy.future import select
from app.database import AsyncSessionLocal
from app.models.identity import Organization, User
from app.models.event import Event, CustodyEvent, LedgerSync
import uuid

async def seed_system():
    async with AsyncSessionLocal() as session:
        zero_uuid = uuid.UUID("00000000-0000-0000-0000-000000000000")
        
        # Org
        existing_org = await session.execute(select(Organization).where(Organization.org_id == zero_uuid))
        if not existing_org.scalar_one_or_none():
            org = Organization(org_id=zero_uuid, name="System", type="SYSTEM", fabric_msp_id="SystemMSP", status="ACTIVE")
            session.add(org)
            
        # User
        existing_user = await session.execute(select(User).where(User.user_id == zero_uuid))
        if not existing_user.scalar_one_or_none():
            user = User(user_id=zero_uuid, organization_id=zero_uuid, role_id="system", auth_subject="system", status="ACTIVE")
            session.add(user)
            
        await session.commit()
        print("System org and user seeded.")

if __name__ == "__main__":
    asyncio.run(seed_system())
