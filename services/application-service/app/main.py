from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1_router import api_v1_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SIH 2026 Developer 3 Application / Backend Microservice - Handles Auth/RBAC, Public APIs, Workflow Orchestration, QR Resolution, Feedback Accountability, Risk Propagator & Recall Actions.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "application-service",
        "version": settings.VERSION,
        "mock_mode": settings.MOCK_MODE,
        "downstream_services": {
            "data_service": settings.DATA_SERVICE_URL if not settings.MOCK_MODE else "MOCK_ACTIVE",
            "blockchain_service": settings.BLOCKCHAIN_SERVICE_URL if not settings.MOCK_MODE else "MOCK_ACTIVE"
        }
    }

from app.api.webhooks import router as webhooks_router

# Include API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

# Include Internal Webhooks Router
app.include_router(webhooks_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
