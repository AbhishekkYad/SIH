from fastapi import APIRouter, Depends, status
from app.auth import get_current_actor, ActorContext
from app.schemas.feedback import FeedbackSubmitRequest, IncidentResponse
from app.modules.feedback.service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["Feedback & Incidents"])
feedback_service = FeedbackService()


@router.post("/submit", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    payload: FeedbackSubmitRequest,
    actor: ActorContext = Depends(get_current_actor)
):
    """Submit consumer feedback / issue report for a product batch or unit."""
    return await feedback_service.submit_feedback(payload, actor)


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    actor: ActorContext = Depends(get_current_actor)
):
    """Retrieve details of a registered incident."""
    return await feedback_service.get_incident(incident_id)
