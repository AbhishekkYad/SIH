from typing import List, Dict, Any
from app.auth.dependencies import ActorContext
from app.clients import get_data_client


class AuditService:
    def __init__(self):
        self.data_client = get_data_client()

    async def get_audit_trail(self, actor: ActorContext) -> List[Dict[str, Any]]:
        scans = getattr(self.data_client, "scan_events", [])
        return scans
