import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import our settings and Base metadata
from app.config import settings
from app.database import Base

# Import all models to ensure they are registered on Base.metadata
from app.models.identity import Organization, User, RolePermission
from app.models.product import Product
from app.models.batch import Batch
from app.models.unit import Unit
from app.models.event import Event, CustodyEvent, LedgerSync
from app.models.lineage import LineageEdge
from app.models.qr import QrCredential
from app.models.incident import Incident, Feedback, AccountabilityRecord
from app.models.evidence import Evidence
from app.models.risk import RiskScope, RiskScopeNode, RecallAction
from app.models.audit import ScanEvent, AuditLog

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    # Set the sqlalchemy.url option dynamically from Pydantic settings
    alembic_config = config.get_section(config.config_ini_section) or {}
    alembic_config["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = async_engine_from_config(
        alembic_config,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
