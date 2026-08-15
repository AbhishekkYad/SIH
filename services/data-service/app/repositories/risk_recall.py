from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any

from app.models.risk import RiskScope, RiskScopeNode, RecallAction

class RiskRecallRepository:
    @staticmethod
    async def create_risk_scope(db: AsyncSession, incident_id, scope_status: str = "POTENTIAL") -> RiskScope:
        scope = RiskScope(
            incident_id=incident_id,
            scope_status=scope_status
        )
        db.add(scope)
        await db.flush()
        return scope

    @staticmethod
    async def add_scope_nodes(db: AsyncSession, scope_id, nodes: List[Dict[str, str]]) -> List[RiskScopeNode]:
        created_nodes = []
        for node_data in nodes:
            node = RiskScopeNode(
                scope_id=scope_id,
                entity_type=node_data["entity_type"],  # BATCH, UNIT
                entity_id=node_data["entity_id"],
                impact_status=node_data.get("impact_status", "POTENTIAL")
            )
            db.add(node)
            created_nodes.append(node)
        await db.flush()
        return created_nodes

    @staticmethod
    async def get_risk_scope(db: AsyncSession, scope_id) -> RiskScope | None:
        stmt = select(RiskScope).where(RiskScope.scope_id == scope_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_recall_action(db: AsyncSession, incident_id, scope_id, action_type: str, authorized_by) -> RecallAction:
        recall = RecallAction(
            incident_id=incident_id,
            scope_id=scope_id,
            action_type=action_type,
            status="INITIATED",
            authorized_by=authorized_by
        )
        db.add(recall)
        await db.flush()
        return recall

    @staticmethod
    async def update_recall_status(db: AsyncSession, recall_action_id, status: str) -> RecallAction | None:
        stmt = select(RecallAction).where(RecallAction.recall_action_id == recall_action_id)
        result = await db.execute(stmt)
        recall = result.scalar_one_or_none()
        if recall:
            recall.status = status
            await db.flush()
        return recall
