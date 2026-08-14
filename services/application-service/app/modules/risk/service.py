from typing import List, Dict, Any
import datetime
from fastapi import HTTPException, status
from app.auth.dependencies import ActorContext
from app.clients import get_data_client
from app.schemas.risk import RiskPropagateRequest, RiskScopeResponse


class RiskService:
    def __init__(self):
        self.data_client = get_data_client()

    async def propagate_risk(self, payload: RiskPropagateRequest, actor: ActorContext) -> RiskScopeResponse:
        source_id = payload.source_batch_id
        direction = payload.direction.upper()
        
        source_batch = await self.data_client.get_batch(source_id)
        if not source_batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Source batch '{source_id}' not found")
        
        affected_parents: List[Dict[str, Any]] = []
        affected_children: List[Dict[str, Any]] = []
        affected_orgs: set = {source_batch["producer_org_id"], source_batch["current_custodian_org_id"]}
        
        # Upstream Traversal
        if direction in ["UPSTREAM", "BOTH"]:
            parents = await self.data_client.get_parents(source_id)
            for p in parents:
                affected_parents.append(p)
                affected_orgs.add(p["producer_org_id"])
                affected_orgs.add(p["current_custodian_org_id"])
        
        # Downstream Traversal
        if direction in ["DOWNSTREAM", "BOTH"]:
            children = await self.data_client.get_children(source_id)
            for c in children:
                affected_children.append(c)
                affected_orgs.add(c["producer_org_id"])
                affected_orgs.add(c["current_custodian_org_id"])
        
        risk_level = "HIGH" if (affected_parents or affected_children) else "MEDIUM"
        computed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        return RiskScopeResponse(
            source_batch_id=source_id,
            direction=direction,
            affected_parent_batches=affected_parents,
            affected_child_batches=affected_children,
            affected_organizations=list(affected_orgs),
            risk_level=risk_level,
            computed_at=computed_at
        )
