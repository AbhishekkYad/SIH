import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.identity import Organization, RolePermission, User

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

    @staticmethod
    async def create_or_update_user(db: AsyncSession, organization_id: uuid.UUID, role_id: str, auth_subject: str, user_id: uuid.UUID = None) -> User:
        # Check duplicate auth_subject to update role/organization if it exists
        stmt = select(User).where(User.auth_subject == auth_subject)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            existing.organization_id = organization_id
            existing.role_id = role_id
            await db.flush()
            return existing

        user = User(
            user_id=user_id or uuid.uuid4(),
            organization_id=organization_id,
            role_id=role_id,
            auth_subject=auth_subject,
            status="ACTIVE"
        )
        db.add(user)
        await db.flush()
        return user

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
        result = await db.execute(
            select(User).where(User.user_id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_subject(db: AsyncSession, auth_subject: str) -> User | None:
        result = await db.execute(
            select(User).where(User.auth_subject == auth_subject)
        )
        return result.scalar_one_or_none()
