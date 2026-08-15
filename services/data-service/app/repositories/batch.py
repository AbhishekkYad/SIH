from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.batch import Batch

class BatchRepository:
    @staticmethod
    async def create(db: AsyncSession, batch_id: str, product_id, quantity, state: str, owner_org_id, parent_metadata: dict = None) -> Batch:
        batch = Batch(
            batch_id=batch_id,
            product_id=product_id,
            parent_metadata=parent_metadata,
            quantity=quantity,
            state=state,
            owner_org_id=owner_org_id
        )
        db.add(batch)
        await db.flush()
        return batch

    @staticmethod
    async def get_by_id(db: AsyncSession, batch_id: str) -> Batch | None:
        result = await db.execute(select(Batch).where(Batch.batch_id == batch_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_state(db: AsyncSession, batch_id: str, state: str) -> Batch | None:
        batch = await BatchRepository.get_by_id(db, batch_id)
        if batch:
            batch.state = state
            await db.flush()
        return batch
