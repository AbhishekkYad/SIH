from fastapi import APIRouter, Depends, status, UploadFile, File
from typing import Dict, Any
from app.auth import get_current_actor, ActorContext
from app.modules.evidence.service import EvidenceService

router = APIRouter(prefix="/evidence", tags=["Evidence (IPFS)"])
evidence_service = EvidenceService()


@router.post("/upload", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    file: UploadFile = File(...),
    actor: ActorContext = Depends(get_current_actor)
):
    """Upload lab reports, certificates, or feedback attachments off-chain to IPFS."""
    content = await file.read()
    return await evidence_service.upload_evidence(file.filename or "evidence.bin", content, actor)


@router.get("/{cid}", response_model=Dict[str, Any])
async def get_evidence_metadata(
    cid: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve metadata and verification info for an IPFS evidence CID."""
    return await evidence_service.get_evidence_metadata(cid)
