from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import LoginRequest, TokenResponse, UserMeResponse
from app.auth import create_access_token, get_current_actor, ActorContext
from app.modules import (
    products_router,
    batches_router,
    qr_router,
    feedback_router,
    risk_router,
    recall_router
)
from app.modules.units import units_router
from app.modules.lineage import lineage_router
from app.modules.evidence import evidence_router
from app.modules.dashboard import dashboard_router
from app.modules.audit import audit_router

api_v1_router = APIRouter()

# Auth Endpoints
auth_router = APIRouter(prefix="/auth", tags=["Auth"])


@auth_router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """Authenticate actor and return JWT bearer access token."""
    # Simplified authentication for V1 demo / contract
    if not payload.username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is required")
    
    user_id = f"usr-{payload.username.lower()}"
    token = create_access_token(subject=user_id, role=payload.role or "producer", org_id=payload.org_id or "org-citrus-farms")
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=1440,
        user_id=user_id,
        role=payload.role or "producer",
        org_id=payload.org_id or "org-citrus-farms"
    )


@auth_router.get("/me", response_model=UserMeResponse)
async def get_me(actor: ActorContext = Depends(get_current_actor)):
    """Retrieve current authenticated actor identity and role context."""
    return UserMeResponse(
        user_id=actor.user_id,
        role=actor.role,
        org_id=actor.org_id,
        status="ACTIVE"
    )


api_v1_router.include_router(auth_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(batches_router)
api_v1_router.include_router(units_router)
api_v1_router.include_router(lineage_router)
api_v1_router.include_router(qr_router)
api_v1_router.include_router(evidence_router)
api_v1_router.include_router(feedback_router)
api_v1_router.include_router(risk_router)
api_v1_router.include_router(recall_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(audit_router)
