from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import uuid

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.product import ProductCreate, ProductOut
from app.repositories.product import ProductRepository
from app.redis.client import redis_cache
from app.redis.keys import CacheKeys

logger = logging.getLogger("sih.api.products")
router = APIRouter(prefix="/internal/products", tags=["products"], dependencies=[Depends(verify_internal_api_key)])

@router.post("", response_model=APIResponse[ProductOut], status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new product read model in the database.
    """
    existing = await ProductRepository.get_by_id(db, payload.product_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with ID {payload.product_id} already exists."
        )

    product = await ProductRepository.create(
        db=db,
        product_id=payload.product_id,
        name=payload.name,
        product_type=payload.product_type,
        category=payload.category
    )
    
    product_out = ProductOut.model_validate(product)
    return APIResponse(
        success=True,
        data=product_out,
        message="Product read model created successfully."
    )

@router.get("/{product_id}", response_model=APIResponse[ProductOut])
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Retrieves product read model details by ID (incorporates Cache-Aside pattern).
    """
    # 1. Check Redis Cache
    cache_key = f"product:{product_id}:v1"  # standard product key format
    cached = await redis_cache.get_json(cache_key)
    if cached:
        logger.info(f"Product cache hit: {product_id}")
        return APIResponse(
            success=True,
            data=ProductOut(**cached),
            message="Product retrieved from cache."
        )

    # 2. Check Database
    logger.info(f"Product cache miss: {product_id}. Querying database.")
    product = await ProductRepository.get_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found."
        )

    product_out = ProductOut.model_validate(product)
    
    # 3. Store in Redis Cache
    await redis_cache.set_json(cache_key, product_out.model_dump(mode="json"), expire=3600)
    
    return APIResponse(
        success=True,
        data=product_out,
        message="Product retrieved from database."
    )
