from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import logging

from app.config import settings
from app.database import engine
from app.dependencies import get_db
from app.redis.client import redis_cache
from app.ipfs.client import ipfs_client

# Import API routers
from app.api.products import router as products_router
from app.api.batches import router as batches_router
from app.api.units import router as units_router
from app.api.qr import router as qr_router
from app.api.lineage import router as lineage_router
from app.api.events import router as events_router
from app.api.incidents import router as incidents_router
from app.api.evidence import router as evidence_router
from app.api.risk_recall import router as risk_recall_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sih.main")

# FastAPI Lifespan Handler
async def lifespan(app: FastAPI):
    # Startup: Initialize Redis connection pool
    await redis_cache.connect()
    yield
    # Shutdown: Release Redis connection pool resources
    await redis_cache.close()

app = FastAPI(
    title="SIH 2026 Data & Storage Microservice",
    description="Persistence Boundary Microservice owning PostgreSQL, Redis, and IPFS boundaries.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restricted in production environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(products_router)
app.include_router(batches_router)
app.include_router(units_router)
app.include_router(qr_router)
app.include_router(lineage_router)
app.include_router(events_router)
app.include_router(incidents_router)
app.include_router(evidence_router)
app.include_router(risk_recall_router)

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Simple API status check to verify the container is alive."""
    return {"status": "ok", "service": "data-service"}

@app.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Readiness probe that checks connection liveness to PostgreSQL, Redis, and IPFS.
    PostgreSQL is treated as a hard dependency (returns 503 if down).
    Redis and IPFS are probed, but do not block service startup.
    """
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        logger.error(f"Readiness check failed for PostgreSQL: {e}")
        db_ok = False
    
    redis_ok = await redis_cache.is_ready()
    ipfs_ok = await ipfs_client.is_ready()
    
    status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE
    
    return JSONResponse(
        status_code=status_code,
        content={
            "success": db_ok,
            "components": {
                "database": "UP" if db_ok else "DOWN",
                "redis": "UP" if redis_ok else "DOWN",
                "ipfs": "UP" if ipfs_ok else "DOWN"
            }
        }
    )
