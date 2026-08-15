from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.models.incident import Incident, Feedback, AccountabilityRecord

class IncidentRepository:
    @staticmethod
    async def create_incident(db: AsyncSession, category: str, severity: str, source: str, unit_id: str = None, batch_id: str = None) -> Incident:
        incident = Incident(
            unit_id=unit_id,
            batch_id=batch_id,
            category=category,
            severity=severity,
            status="SUBMITTED",
            source=source
        )
        db.add(incident)
        await db.flush()
        return incident

    @staticmethod
    async def get_incident(db: AsyncSession, incident_id) -> Incident | None:
        result = await db.execute(select(Incident).where(Incident.incident_id == incident_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_feedback(db: AsyncSession, category: str, description: str, incident_id = None, unit_id: str = None, batch_id: str = None, evidence_ref: str = None, location_granularity: str = None) -> Feedback:
        feedback = Feedback(
            incident_id=incident_id,
            unit_id=unit_id,
            batch_id=batch_id,
            category=category,
            description=description,
            evidence_ref=evidence_ref,
            location_granularity=location_granularity,
            verification_status="UNVERIFIED"
        )
        db.add(feedback)
        await db.flush()
        return feedback

    @staticmethod
    async def get_feedback_by_incident(db: AsyncSession, incident_id) -> List[Feedback]:
        stmt = select(Feedback).where(Feedback.incident_id == incident_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_accountability_record(db: AsyncSession, incident_id, stakeholder_org_id, level: int, signal_value, reason: str = None) -> AccountabilityRecord:
        record = AccountabilityRecord(
            incident_id=incident_id,
            stakeholder_org_id=stakeholder_org_id,
            level=level,
            signal_value=signal_value,
            reason=reason
        )
        db.add(record)
        await db.flush()
        return record

    @staticmethod
    async def get_accountability_by_incident(db: AsyncSession, incident_id) -> List[AccountabilityRecord]:
        stmt = select(AccountabilityRecord).where(AccountabilityRecord.incident_id == incident_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())
