import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.identity import Organization, RolePermission

class IdentityRepository:
    @staticmethod
    async def create_organization(db: AsyncSession, name: str, type: str, fabric_msp_id: str, org_id: uuid.UUID = None) -> Organization:
        org = Organization(
            org_id=org_id or uuid.uuid4(),
            name=name,
            type=type,
            fabric_msp_id=fabric_msp_id,
            status="ACTIVE"
        )
        db.add(org)
        await db.flush()
        return org

    @staticmethod
    async def get_organization_by_id(db: AsyncSession, org_id: uuid.UUID) -> Organization | None:
        result = await db.execute(
            select(Organization).where(Organization.org_id == org_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_organization_by_name(db: AsyncSession, name: str) -> Organization | None:
        result = await db.execute(
            select(Organization).where(Organization.name == name)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def assign_role_permission(db: AsyncSession, role_id: str, permission_code: str) -> RolePermission:
        # Check if already exists to avoid primary key conflict
        stmt = select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_code == permission_code
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        perm = RolePermission(
            role_id=role_id,
            permission_code=permission_code
        )
        db.add(perm)
        await db.flush()
        return perm

    @staticmethod
    async def get_role_permissions(db: AsyncSession, role_id: str) -> list[RolePermission]:
        stmt = select(RolePermission).where(RolePermission.role_id == role_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())
