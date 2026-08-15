from typing import Dict, Any, List
from fastapi import HTTPException, status
from app.auth.dependencies import ActorContext
from app.clients import get_data_client
from app.schemas.risk import RiskScopeResponse


class LineageService:
    def __init__(self):
        self.data_client = get_data_client()

    async def get_parents(self, batch_id: str) -> List[Dict[str, Any]]:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        return await self.data_client.get_parents(batch_id)

    async def get_children(self, batch_id: str) -> List[Dict[str, Any]]:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        return await self.data_client.get_children(batch_id)

    async def get_full_lineage(self, batch_id: str) -> Dict[str, Any]:
        batch = await self.data_client.get_batch(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{batch_id}' not found")
        
        parents = await self.data_client.get_parents(batch_id)
        children = await self.data_client.get_children(batch_id)
        
        return {
            "target_batch_id": batch_id,
            "current_state": batch["lifecycle_state"],
            "parents": parents,
            "children": children,
            "total_parents": len(parents),
            "total_children": len(children)
        }
