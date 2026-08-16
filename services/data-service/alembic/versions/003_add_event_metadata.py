"""add event metadata

Revision ID: 003_add_event_metadata
Revises: 002_add_location_metadata
Create Date: 2026-08-16 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_add_event_metadata'
down_revision: Union[str, None] = '002_add_location_metadata'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('metadata', sa.JSON(), nullable=True))
    op.add_column('custody_events', sa.Column('metadata', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('custody_events', 'metadata')
    op.drop_column('events', 'metadata')
