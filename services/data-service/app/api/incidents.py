from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, UUID4
from typing import Optional
from decimal import Decimal
import logging

from app.dependencies import get_db, verify_internal_api_key
from app.schemas.common import APIResponse
from app.schemas.incident import IncidentCreate, FeedbackCreate
from app.repositories.incident import IncidentRepository
from app.redis.client import redis_cache
from app.redis.keys import CacheKeys

logger = logging.getLogger("sih.api.incidents")
router = APIRouter(prefix="/internal/incidents", tags=["incidents"], dependencies=[Depends(verify_internal_api_key)])

class AccountabilityRecordCreate(BaseModel):
    stakeholder_org_id: UUID4
    level: int
    signal_value: Decimal
    reason: Optional[str] = None

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_incident(payload: IncidentCreate, db: AsyncSession = Depends(get_db)):
    """
    Saves an escalated Incident read model.
    """
    try:
        incident = await IncidentRepository.create_incident(
            db=db,
            category=payload.category,
            severity=payload.severity,
            source=payload.source,
            unit_id=payload.unit_id,
            batch_id=payload.batch_id
        )
        return APIResponse(
            success=True,
            data={
                "incident_id": incident.incident_id,
                "status": incident.status
            },
            message="Incident registered successfully."
        )
    except Exception as e:
        logger.error(f"Failed to create incident: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to register incident: {e}"
        )

@router.post("/feedback", status_code=status.HTTP_201_CREATED)
async def create_feedback(payload: FeedbackCreate, db: AsyncSession = Depends(get_db)):
    """
    Records a raw consumer complaint or feedback report.
    """
    try:
        feedback = await IncidentRepository.create_feedback(
            db=db,
            category=payload.category,
            description=payload.description,
            unit_id=payload.unit_id,
            batch_id=payload.batch_id,
            evidence_ref=payload.evidence_ref,
            location_granularity=payload.location_granularity
        )
        return APIResponse(
            success=True,
            data={
                "feedback_id": feedback.feedback_id,
                "verification_status": feedback.verification_status
            },
            message="Feedback complaint recorded successfully."
        )
    except Exception as e:
        logger.error(f"Feedback save failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save feedback: {e}"
        )

@router.post("/{incident_id}/accountability", status_code=status.HTTP_201_CREATED)
async def create_accountability(incident_id: UUID4, payload: AccountabilityRecordCreate, db: AsyncSession = Depends(get_db)):
    """
    Attributes accountability metrics to a stakeholder organization associated with an incident.
    """
    incident = await IncidentRepository.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {incident_id} not found."
        )

    try:
        record = await IncidentRepository.create_accountability_record(
            db=db,
            incident_id=incident_id,
            stakeholder_org_id=payload.stakeholder_org_id,
            level=payload.level,
            signal_value=payload.signal_value,
            reason=payload.reason
        )
        return APIResponse(
            success=True,
            data={
                "record_id": record.record_id,
                "incident_id": record.incident_id
            },
            message="Accountability metrics attributed successfully."
        )
    except Exception as e:
        logger.error(f"Accountability save failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to attribute accountability: {e}"
        )
