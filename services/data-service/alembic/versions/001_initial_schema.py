"""Initial schema migration

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-15 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Organizations
    op.create_table(
        'organizations',
        sa.Column('org_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('fabric_msp_id', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('org_id')
    )

    # 2. Users
    op.create_table(
        'users',
        sa.Column('user_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('auth_subject', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.org_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('auth_subject')
    )

    # 3. Role Permissions
    op.create_table(
        'roles_permissions',
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('permission_code', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('role_id', 'permission_code')
    )

    # 4. Products
    op.create_table(
        'products',
        sa.Column('product_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('product_type', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('product_id')
    )

    # 5. Batches
    op.create_table(
        'batches',
        sa.Column('batch_id', sa.String(), nullable=False),
        sa.Column('product_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('parent_metadata', sa.JSON(), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('state', sa.String(), nullable=False),
        sa.Column('owner_org_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['owner_org_id'], ['organizations.org_id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('batch_id')
    )

    # 6. Units
    op.create_table(
        'units',
        sa.Column('unit_id', sa.String(), nullable=False),
        sa.Column('batch_id', sa.String(), nullable=False),
        sa.Column('serial_reference', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=False),
        sa.Column('qr_credential_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.batch_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('unit_id'),
        sa.UniqueConstraint('serial_reference')
    )

    # 7. Events
    op.create_table(
        'events',
        sa.Column('event_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('actor_org_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_user_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('target_id', sa.String(), nullable=False),
        sa.Column('state_before', sa.String(), nullable=True),
        sa.Column('state_after', sa.String(), nullable=True),
        sa.Column('fabric_tx_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['actor_org_id'], ['organizations.org_id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.user_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('event_id'),
        sa.UniqueConstraint('fabric_tx_id')
    )

    # 8. Custody Events
    op.create_table(
        'custody_events',
        sa.Column('event_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('batch_id', sa.String(), nullable=False),
        sa.Column('from_org_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('to_org_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('carrier_name', sa.String(), nullable=True),
        sa.Column('transfer_status', sa.String(), nullable=False),
        sa.Column('fabric_tx_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.batch_id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['from_org_id'], ['organizations.org_id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['to_org_id'], ['organizations.org_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('event_id'),
        sa.UniqueConstraint('fabric_tx_id')
    )

    # 9. Ledger Sync
    op.create_table(
        'ledger_sync',
        sa.Column('fabric_tx_id', sa.String(), nullable=False),
        sa.Column('channel_id', sa.String(), nullable=False),
        sa.Column('chaincode_name', sa.String(), nullable=False),
        sa.Column('block_number', sa.Integer(), nullable=False),
        sa.Column('sync_status', sa.String(), nullable=False),
        sa.Column('error_details', sa.String(), nullable=True),
        sa.Column('synced_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('fabric_tx_id')
    )

    # 10. Lineage Edges
    op.create_table(
        'lineage_edges',
        sa.Column('edge_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('parent_batch_id', sa.String(), nullable=False),
        sa.Column('child_batch_id', sa.String(), nullable=False),
        sa.Column('relation_type', sa.String(), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['child_batch_id'], ['batches.batch_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_batch_id'], ['batches.batch_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('edge_id'),
        sa.UniqueConstraint('parent_batch_id', 'child_batch_id', name='uq_parent_child_edge')
    )

    # 11. QR Credentials
    op.create_table(
        'qr_credentials',
        sa.Column('qr_credential_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('unit_id', sa.String(), nullable=True),
        sa.Column('public_reference', sa.String(), nullable=False),
        sa.Column('credential_hash', sa.String(), nullable=False),
        sa.Column('credential_status', sa.String(), nullable=False),
        sa.Column('binding_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['unit_id'], ['units.unit_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('qr_credential_id'),
        sa.UniqueConstraint('public_reference')
    )

    # Add back foreign key constraint in units table referencing qr_credentials
    op.create_foreign_key(
        'fk_unit_qr_credential',
        'units', 'qr_credentials',
        ['qr_credential_id'], ['qr_credential_id'],
        ondelete='SET NULL'
    )

    # 12. Incidents
    op.create_table(
        'incidents',
        sa.Column('incident_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('batch_id', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('reported_at', sa.DateTime(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.batch_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('incident_id')
    )

    # 13. Feedback
    op.create_table(
        'feedback',
        sa.Column('feedback_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('incident_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('batch_id', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('evidence_ref', sa.String(), nullable=True),
        sa.Column('location_granularity', sa.String(), nullable=True),
        sa.Column('verification_status', sa.String(), nullable=False),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.batch_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.incident_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('feedback_id')
    )

    # 14. Accountability Records
    op.create_table(
        'accountability_records',
        sa.Column('record_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('incident_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('stakeholder_org_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('signal_value', sa.Float(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.incident_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['stakeholder_org_id'], ['organizations.org_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('record_id')
    )

    # 15. Evidence
    op.create_table(
        'evidence',
        sa.Column('evidence_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('cid', sa.String(), nullable=False),
        sa.Column('content_hash', sa.String(), nullable=False),
        sa.Column('owner_org_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('evidence_type', sa.String(), nullable=False),
        sa.Column('access_class', sa.String(), nullable=False),
        sa.Column('linked_entity_type', sa.String(), nullable=True),
        sa.Column('linked_entity_id', sa.String(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['owner_org_id'], ['organizations.org_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('evidence_id'),
        sa.UniqueConstraint('cid')
    )

    # 16. Risk Scopes
    op.create_table(
        'risk_scopes',
        sa.Column('scope_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('incident_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('scope_status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.incident_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('scope_id')
    )

    # 17. Risk Scope Nodes
    op.create_table(
        'risk_scope_nodes',
        sa.Column('node_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('scope_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('impact_status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['scope_id'], ['risk_scopes.scope_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('node_id'),
        sa.UniqueConstraint('scope_id', 'entity_type', 'entity_id', name='uq_scope_node_entity')
    )

    # 18. Recall Actions
    op.create_table(
        'recall_actions',
        sa.Column('recall_action_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('incident_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('scope_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('authorized_by', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('initiated_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['authorized_by'], ['users.user_id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.incident_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['scope_id'], ['risk_scopes.scope_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('recall_action_id')
    )

    # 19. Scan Events
    op.create_table(
        'scan_events',
        sa.Column('scan_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('actor_org_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('result', sa.String(), nullable=False),
        sa.Column('device_info', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['actor_org_id'], ['organizations.org_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('scan_id')
    )

    # 20. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('log_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_user_id', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=True),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.user_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('log_id')
    )


def downgrade() -> None:
    # Drop in reverse order to respect constraints
    op.drop_table('audit_logs')
    op.drop_table('scan_events')
    op.drop_table('recall_actions')
    op.drop_table('risk_scope_nodes')
    op.drop_table('risk_scopes')
    op.drop_table('evidence')
    op.drop_table('accountability_records')
    op.drop_table('feedback')
    op.drop_table('incidents')
    
    # Remove units constraints referring to qr_credentials before drops
    op.drop_constraint('fk_unit_qr_credential', 'units', type_='foreignkey')
    
    op.drop_table('qr_credentials')
    op.drop_table('lineage_edges')
    op.drop_table('ledger_sync')
    op.drop_table('custody_events')
    op.drop_table('events')
    op.drop_table('units')
    op.drop_table('batches')
    op.drop_table('products')
    op.drop_table('roles_permissions')
    op.drop_table('users')
    op.drop_table('organizations')
