from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.qr import QrCredential

class QrRepository:
    @staticmethod
    async def create(db: AsyncSession, public_reference: str, credential_hash: str, unit_id: str = None, credential_status: str = "ACTIVE", binding_metadata: dict = None) -> QrCredential:
        qr = QrCredential(
            unit_id=unit_id,
            public_reference=public_reference,
            credential_hash=credential_hash,
            credential_status=credential_status,
            binding_metadata=binding_metadata
        )
        db.add(qr)
        await db.flush()
        return qr

    @staticmethod
    async def get_by_public_ref(db: AsyncSession, public_reference: str) -> QrCredential | None:
        result = await db.execute(
            select(QrCredential).where(QrCredential.public_reference == public_reference)
        )
        return result.scalar_one_or_none()
