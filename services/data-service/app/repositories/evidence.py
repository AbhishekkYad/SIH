from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.models.evidence import Evidence

class EvidenceRepository:
    @staticmethod
    async def create(db: AsyncSession, cid: str, content_hash: str, type: str, owner_org_id, access_class: str = "RESTRICTED", linked_entity_type: str = None, linked_entity_id: str = None) -> Evidence:
        evidence = Evidence(
            cid=cid,
            content_hash=content_hash,
            type=type,
            access_class=access_class,
            linked_entity_type=linked_entity_type,
            linked_entity_id=linked_entity_id,
            owner_org_id=owner_org_id
        )
        db.add(evidence)
        await db.flush()
        return evidence

    @staticmethod
    async def get_by_cid(db: AsyncSession, cid: str) -> Evidence | None:
        result = await db.execute(select(Evidence).where(Evidence.cid == cid))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_linked_entity(db: AsyncSession, linked_entity_type: str, linked_entity_id: str) -> List[Evidence]:
        stmt = select(Evidence).where(
            Evidence.linked_entity_type == linked_entity_type,
            Evidence.linked_entity_id == linked_entity_id
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
