from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.unit import UnitCreate, UnitOut
from app.repositories.unit import UnitRepository
from app.redis.client import redis_cache
from app.redis.keys import CacheKeys

logger = logging.getLogger("sih.api.units")
router = APIRouter(prefix="/internal/units", tags=["units"], dependencies=[Depends(verify_internal_api_key)])

@router.post("", response_model=APIResponse[UnitOut], status_code=status.HTTP_201_CREATED)
async def create_unit(payload: UnitCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers or updates an individual unit read model.
    """
    existing = await UnitRepository.get_by_id(db, payload.unit_id)
    if existing:
        existing.state = payload.state
        existing.qr_credential_id = payload.qr_credential_id
        await db.flush()
        
        # Invalidate cache
        await redis_cache.delete(CacheKeys.unit(payload.unit_id))
        
        unit_out = UnitOut.model_validate(existing)
        return APIResponse(
            success=True,
            data=unit_out,
            message="Unit read model updated successfully."
        )

    unit = await UnitRepository.create(
        db=db,
        unit_id=payload.unit_id,
        batch_id=payload.batch_id,
        serial_reference=payload.serial_reference,
        state=payload.state,
        qr_credential_id=payload.qr_credential_id
    )
    
    # Invalidate cache
    await redis_cache.delete(CacheKeys.unit(payload.unit_id))
    
    unit_out = UnitOut.model_validate(unit)
    return APIResponse(
        success=True,
        data=unit_out,
        message="Unit read model registered successfully."
    )

@router.get("/{unit_id}", response_model=APIResponse[UnitOut])
async def get_unit(unit_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves unit read model by ID using Cache-Aside.
    """
    # 1. Check Redis Cache
    cache_key = CacheKeys.unit(unit_id)
    cached = await redis_cache.get_json(cache_key)
    if cached:
        logger.info(f"Unit cache hit: {unit_id}")
        return APIResponse(
            success=True,
            data=UnitOut(**cached),
            message="Unit retrieved from cache."
        )

    # 2. Check Database
    logger.info(f"Unit cache miss: {unit_id}. Querying database.")
    unit = await UnitRepository.get_by_id(db, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unit with ID {unit_id} not found."
        )

    unit_out = UnitOut.model_validate(unit)
    
    # 3. Store in Redis Cache
    await redis_cache.set_json(cache_key, unit_out.model_dump(mode="json"), expire=3600)
    
    return APIResponse(
        success=True,
        data=unit_out,
        message="Unit retrieved from database."
    )
