from typing import Dict, Any, List
import datetime
from app.auth.dependencies import ActorContext
from app.clients import get_data_client


class DashboardService:
    def __init__(self):
        self.data_client = get_data_client()

    async def get_supply_chain_overview(self, actor: ActorContext) -> Dict[str, Any]:
        products_count = len(getattr(self.data_client, "products", {}))
        batches_count = len(getattr(self.data_client, "batches", {}))
        scans_count = len(getattr(self.data_client, "scan_events", []))
        incidents_count = len(getattr(self.data_client, "incidents", {}))
        recalls_count = len(getattr(self.data_client, "recalls", {}))
        
        return {
            "overview_status": "ACTIVE",
            "actor_org_id": actor.org_id,
            "metrics": {
                "total_products": products_count,
                "total_batches": batches_count,
                "total_scan_audits": scans_count,
                "active_incidents": incidents_count,
                "recall_actions_issued": recalls_count
            },
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    async def get_batch_dashboard(self, actor: ActorContext) -> List[Dict[str, Any]]:
        batches = getattr(self.data_client, "batches", {})
        return list(batches.values())

    async def get_incident_dashboard(self, actor: ActorContext) -> List[Dict[str, Any]]:
        incidents = getattr(self.data_client, "incidents", {})
        return list(incidents.values())
