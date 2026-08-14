from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.unit import Unit

class UnitRepository:
    @staticmethod
    async def create(db: AsyncSession, unit_id: str, batch_id: str, serial_reference: str, state: str, qr_credential_id = None) -> Unit:
        unit = Unit(
            unit_id=unit_id,
            batch_id=batch_id,
            serial_reference=serial_reference,
            state=state,
            qr_credential_id=qr_credential_id
        )
        db.add(unit)
        await db.flush()
        return unit

    @staticmethod
    async def get_by_id(db: AsyncSession, unit_id: str) -> Unit | None:
        result = await db.execute(select(Unit).where(Unit.unit_id == unit_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_state(db: AsyncSession, unit_id: str, state: str) -> Unit | None:
        unit = await UnitRepository.get_by_id(db, unit_id)
        if unit:
            unit.state = state
            await db.flush()
        return unit
