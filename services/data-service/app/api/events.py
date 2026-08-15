from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import List, Optional
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.event import EventCreate, CustodyEventCreate, ScanEventCreate, EventOut
from app.repositories.event import EventRepository
from app.models.audit import ScanEvent
from app.redis.client import redis_cache
from app.redis.keys import CacheKeys

logger = logging.getLogger("sih.api.events")
router = APIRouter(prefix="/internal/events", tags=["events"], dependencies=[Depends(verify_internal_api_key)])

@router.post("", status_code=status.HTTP_201_CREATED)
async def sync_blockchain_event(payload: EventCreate, db: AsyncSession = Depends(get_db)):
    """
    Controlled synchronization endpoint for storing read-model blockchain-committed events.
    Checks idempotency by ensuring a UNIQUE(fabric_tx_id).
    """
    try:
        # Mark sync as PENDING in ledger_sync tracker first
        await EventRepository.upsert_ledger_sync(
            db=db,
            fabric_tx_id=payload.fabric_tx_id,
            event_type=payload.type,
            entity_id=payload.target_id,
            sync_status="PENDING",
            attempt_count=1
        )

        event = await EventRepository.create_event(
            db=db,
            event_type=payload.type,
            actor_org_id=payload.actor_org_id,
            actor_user_id=payload.actor_user_id,
            target_id=payload.target_id,
            state_before=payload.state_before,
            state_after=payload.state_after,
            fabric_tx_id=payload.fabric_tx_id,
            timestamp=payload.timestamp
        )

        # Mark sync as SYNCED
        await EventRepository.upsert_ledger_sync(
            db=db,
            fabric_tx_id=payload.fabric_tx_id,
            event_type=payload.type,
            entity_id=payload.target_id,
            sync_status="SYNCED",
            synced_at=datetime.utcnow()
        )

        # Invalidate related batch caches since state has mutated
        cache_key = CacheKeys.batch(payload.target_id)
        await redis_cache.delete(cache_key)
        lineage_key = CacheKeys.trace("lineage", payload.target_id)
        await redis_cache.delete(lineage_key)

        return APIResponse(
            success=True,
            data={
                "event_id": event.event_id,
                "fabric_tx_id": event.fabric_tx_id,
                "type": event.type
            },
            message="Event synchronized successfully."
        )

    except Exception as e:
        logger.error(f"Event synchronization failed for TX {payload.fabric_tx_id}: {e}")
        # Re-raise or record as FAILED in sync tracker
        await EventRepository.upsert_ledger_sync(
            db=db,
            fabric_tx_id=payload.fabric_tx_id,
            event_type=payload.type,
            entity_id=payload.target_id,
            sync_status="FAILED"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync event: {e}"
        )

@router.post("/custody", status_code=status.HTTP_201_CREATED)
async def record_custody_event(payload: CustodyEventCreate, db: AsyncSession = Depends(get_db)):
    """
    Saves a custody/transfer event read model.
    """
    try:
        custody = await EventRepository.create_custody_event(
            db=db,
            batch_id=payload.batch_id,
            unit_id=payload.unit_id,
            from_org_id=payload.from_org_id,
            to_org_id=payload.to_org_id,
            event_type=payload.event_type,
            timestamp=payload.timestamp,
            fabric_tx_id=payload.fabric_tx_id
        )

        # Invalidate cache
        if payload.batch_id:
            await redis_cache.delete(CacheKeys.batch(payload.batch_id))
        if payload.unit_id:
            await redis_cache.delete(CacheKeys.unit(payload.unit_id))

        return APIResponse(
            success=True,
            data={
                "id": custody.id,
                "fabric_tx_id": custody.fabric_tx_id,
                "event_type": custody.event_type
            },
            message="Custody event recorded successfully."
        )
    except Exception as e:
        logger.error(f"Custody event write failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save custody event: {e}"
        )

@router.post("/scans", status_code=status.HTTP_201_CREATED)
async def record_scan_event(payload: ScanEventCreate, db: AsyncSession = Depends(get_db)):
    """
    Persists scan audit trails. A scan is NOT a state-changing business event.
    """
    scan = ScanEvent(
        entity_id=payload.entity_id,
        actor_org_id=payload.actor_org_id,
        location=payload.location,
        result=payload.result
    )
    db.add(scan)
    await db.flush()

    # Invalidate cache for unit QR resolution checks
    await redis_cache.delete(CacheKeys.qr(payload.entity_id))

    return APIResponse(
        success=True,
        data={
            "id": scan.id,
            "entity_id": scan.entity_id,
            "result": scan.result
        },
        message="Scan interaction recorded successfully."
    )

@router.get("", response_model=APIResponse[List[EventOut]])
async def get_events(
    target_id: Optional[str] = None,
    type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves and queries blockchain-committed synchronized events read models.
    """
    events = await EventRepository.get_events(
        db=db,
        target_id=target_id,
        event_type=type,
        limit=limit,
        offset=offset
    )
    events_out = [EventOut.model_validate(e) for e in events]
    return APIResponse(
        success=True,
        data=events_out,
        message="Blockchain events retrieved successfully."
    )
