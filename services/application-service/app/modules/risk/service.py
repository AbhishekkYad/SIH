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
        
        # Location Trace Extraction
        involved_batch_ids = {source_id}
        for p in affected_parents:
            involved_batch_ids.add(p.get("batch_id") or p.get("id"))
        for c in affected_children:
            involved_batch_ids.add(c.get("batch_id") or c.get("id"))
            
        affected_locations = []
        seen_locations = set()
        
        for b_id in involved_batch_ids:
            if not b_id:
                continue
            lineage = await self.data_client.get_lineage(b_id)
            if lineage and "events" in lineage:
                for event in lineage["events"]:
                    lat = event.get("latitude")
                    lng = event.get("longitude")
                    loc_name = event.get("location_name")
                    
                    if lat is not None and lng is not None:
                        # Deduplicate by coordinates and name to avoid redundant entries
                        loc_key = (lat, lng, loc_name)
                        if loc_key not in seen_locations:
                            seen_locations.add(loc_key)
                            affected_locations.append({
                                "latitude": lat,
                                "longitude": lng,
                                "location_name": loc_name,
                                "timestamp": event.get("timestamp"),
                                "batch_id": b_id,
                                "event_type": event.get("type") or event.get("event_type"),
                                "transaction_id": event.get("fabric_tx_id"),
                                "block_number": event.get("block_number"),
                                "channel_id": event.get("channel_id"),
                                "actor_msp": event.get("actor_msp")
                            })
                            
        # Sort locations chronologically
        affected_locations.sort(key=lambda x: str(x.get("timestamp") or ""))
        
        risk_level = "HIGH" if (affected_parents or affected_children) else "MEDIUM"
        computed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        return RiskScopeResponse(
            source_batch_id=source_id,
            direction=direction,
            affected_parent_batches=affected_parents,
            affected_child_batches=affected_children,
            affected_organizations=list(affected_orgs),
            affected_locations=affected_locations,
            risk_level=risk_level,
            computed_at=computed_at
        )
