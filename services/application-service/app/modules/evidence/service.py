from typing import Dict, Any, Optional
from fastapi import HTTPException, status, UploadFile
from app.auth.dependencies import ActorContext
from app.clients import get_data_client


class EvidenceService:
    def __init__(self):
        self.data_client = get_data_client()

    async def upload_evidence(self, file_name: str, content: bytes, actor: ActorContext) -> Dict[str, Any]:
        result = await self.data_client.upload_evidence_to_ipfs(file_name, content)
        from datetime import datetime
        cid = result.get("cid", "QmFallbackCID")
        return {
            "evidence_id": f"ev-{cid[:8]}",
            "cid": cid,
            "filename": file_name,
            "size_bytes": result.get("size_bytes", len(content)),
            "created_by": actor.user_id,
            "created_at": result.get("created_at", datetime.utcnow().isoformat())
        }

    async def get_evidence_metadata(self, cid: str) -> Dict[str, Any]:
        ipfs_storage = getattr(self.data_client, "ipfs_storage", {})
        metadata = ipfs_storage.get(cid)
        if not metadata:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evidence CID '{cid}' not found")
        return metadata
