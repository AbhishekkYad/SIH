"""Add location and block metadata to events

Revision ID: 002_add_location_metadata
Revises: 001_initial_schema
Create Date: 2026-08-16 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_add_location_metadata'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('events', sa.Column('longitude', sa.Float(), nullable=True))
    op.add_column('events', sa.Column('location_name', sa.String(), nullable=True))
    op.add_column('events', sa.Column('block_number', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('events', 'latitude')
    op.drop_column('events', 'longitude')
    op.drop_column('events', 'location_name')
    op.drop_column('events', 'block_number')
