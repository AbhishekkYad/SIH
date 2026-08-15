from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.lineage import LineageOut
from app.repositories.lineage import LineageRepository
from app.redis.client import redis_cache
from app.redis.keys import CacheKeys

logger = logging.getLogger("sih.api.lineage")
router = APIRouter(prefix="/internal/lineage", tags=["lineage"], dependencies=[Depends(verify_internal_api_key)])

class LineageEdgeCreate(BaseModel):
    parent_batch_id: str = Field(..., min_length=1)
    child_batch_id: str = Field(..., min_length=1)
    relation_type: Optional[str] = "TRANSFORMATION"
    quantity: Optional[Decimal] = None

@router.get("/{entity_id}", response_model=APIResponse[LineageOut])
async def get_lineage(entity_id: str, db: AsyncSession = Depends(get_db)):
    """
    Traces and returns both upstream (parents) and downstream (children) lineage relationships
    for the target batch ID. Implements Cache-Aside strategy.
    """
    # 1. Check Redis Cache
    cache_key = CacheKeys.trace("lineage", entity_id)
    cached = await redis_cache.get_json(cache_key)
    if cached:
        logger.info(f"Lineage cache hit: {entity_id}")
        return APIResponse(
            success=True,
            data=LineageOut(**cached),
            message="Lineage retrieved from cache."
        )

    # 2. Check Database (Recursive CTE Query)
    logger.info(f"Lineage cache miss: {entity_id}. Traversing database graph.")
    try:
        lineage_data = await LineageRepository.get_lineage(db, entity_id)
    except Exception as e:
        logger.error(f"Failed to fetch lineage for {entity_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while executing graph lineage traversal."
        )

    lineage_out = LineageOut(**lineage_data)

    # 3. Store in Redis Cache
    await redis_cache.set_json(cache_key, lineage_out.model_dump(mode="json"), expire=3600)

    return APIResponse(
        success=True,
        data=lineage_out,
        message="Lineage graph traversed successfully."
    )

@router.post("/edges", status_code=status.HTTP_201_CREATED)
async def create_lineage_edge(payload: LineageEdgeCreate, db: AsyncSession = Depends(get_db)):
    """
    Saves a direct parent-to-child lineage adjacency edge.
    """
    try:
        edge = await LineageRepository.create_edge(
            db=db,
            parent_batch_id=payload.parent_batch_id,
            child_batch_id=payload.child_batch_id,
            relation_type=payload.relation_type,
            quantity=payload.quantity
        )
    except Exception as e:
        logger.error(f"Failed to create lineage edge: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not save lineage edge. Verify entities exist."
        )

    # Invalidate cache for both parent and child batches, since their graphs changed
    parent_cache_key = CacheKeys.trace("lineage", payload.parent_batch_id)
    child_cache_key = CacheKeys.trace("lineage", payload.child_batch_id)
    await redis_cache.delete(parent_cache_key)
    await redis_cache.delete(child_cache_key)

    return APIResponse(
        success=True,
        data=edge,
        message="Lineage edge registered successfully."
    )
