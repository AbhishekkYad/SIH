from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Header
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import Response
from pydantic import UUID4
from typing import Optional
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.evidence import EvidenceOut
from app.repositories.evidence import EvidenceRepository
from app.ipfs.client import ipfs_client

logger = logging.getLogger("sih.api.evidence")
router = APIRouter(prefix="/internal/evidence", tags=["evidence"], dependencies=[Depends(verify_internal_api_key)])

@router.post("", response_model=APIResponse[EvidenceOut], status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    file: UploadFile = File(...),
    x_owner_org_id: UUID4 = Header(..., alias="X-Owner-Org-Id"),
    evidence_type: str = Header("CERTIFICATE", alias="X-Evidence-Type"),
    access_class: str = Header("RESTRICTED", alias="X-Access-Class"),
    linked_entity_type: Optional[str] = Header(None, alias="X-Linked-Entity-Type"),
    linked_entity_id: Optional[str] = Header(None, alias="X-Linked-Entity-Id"),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives a binary file upload, uploads it directly to Kubo IPFS, and saves metadata in the database.
    Propagates IPFS errors upwards as 503 Service Unavailable (no silent fallbacks).
    """
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # 1. Upload to IPFS Kubo node
    try:
        cid, content_hash = await ipfs_client.add_file(content)
    except Exception as e:
        logger.critical(f"IPFS upload failed: {e}. Raising 503 dependency error.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"IPFS decentralized storage network is unreachable: {str(e)}"
        )

    # 2. Persist metadata referencing IPFS CID in database
    try:
        evidence = await EvidenceRepository.create(
            db=db,
            cid=cid,
            content_hash=content_hash,
            type=evidence_type,
            access_class=access_class,
            linked_entity_type=linked_entity_type,
            linked_entity_id=linked_entity_id,
            owner_org_id=x_owner_org_id
        )
    except Exception as e:
        logger.error(f"Failed to persist evidence metadata in db: {e}")
        # Note: If db write fails, we should technically clean up IPFS if needed, 
        # but since IPFS is content-addressed, a dangling pin is safe.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save evidence record: {e}"
        )

    evidence_out = EvidenceOut.model_validate(evidence)
    return APIResponse(
        success=True,
        data=evidence_out,
        message="File uploaded to IPFS and metadata index successfully saved."
    )

@router.get("/{cid}")
async def get_evidence(cid: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves raw file bytes from IPFS by CID.
    """
    # 1. Fetch metadata index from DB to check existence/access
    evidence = await EvidenceRepository.get_by_cid(db, cid)
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence with CID {cid} not indexed in database."
        )

    # 2. Retrieve file bytes from IPFS Kubo node
    try:
        file_bytes = await ipfs_client.cat_file(cid)
    except Exception as e:
        logger.critical(f"IPFS cat failed for CID {cid}: {e}. Raising 503 dependency error.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"IPFS decentralized storage network is unreachable: {str(e)}"
        )

    return Response(content=file_bytes, media_type="application/octet-stream")
