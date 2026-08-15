from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import uuid
import datetime
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.units import UnitCreate, UnitResponse


class UnitService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    async def create_unit(self, payload: UnitCreate, actor: ActorContext) -> UnitResponse:
        # Check parent batch exists
        batch = await self.data_client.get_batch(payload.batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Batch '{payload.batch_id}' not found")
        
        unit_id = f"unit-{uuid.uuid4().hex[:8]}"
        serial_number = payload.serial_number or f"SN-{uuid.uuid4().hex[:10].upper()}"
        
        # Submit createUnit transaction to Blockchain Service (TraceabilityContract.createUnit)
        tx_res = await self.bc_client.submit_transaction(
            contract="TraceabilityContract",
            function="createUnit",
            args={"unit_id": unit_id, "batch_id": payload.batch_id, "serial_number": serial_number},
            actor_context=actor.dict()
        )
        
        unit_data = {
            "unit_id": unit_id,
            "batch_id": payload.batch_id,
            "serial_number": serial_number,
            "status": "AVAILABLE",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "blockchain_tx_id": tx_res.get("tx_id")
        }
        
        # Save to mock/real data service store
        if hasattr(self.data_client, "units"):
            self.data_client.units[unit_id] = unit_data
            
        return UnitResponse(
            unit_id=unit_data["unit_id"],
            batch_id=unit_data["batch_id"],
            serial_number=unit_data["serial_number"],
            status=unit_data["status"],
            created_at=unit_data["created_at"],
            blockchain_tx_id=unit_data.get("blockchain_tx_id")
        )

    async def get_unit(self, unit_id: str) -> UnitResponse:
        units = getattr(self.data_client, "units", {})
        unit = units.get(unit_id)
        if not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Unit '{unit_id}' not found")
        
        return UnitResponse(
            unit_id=unit["unit_id"],
            batch_id=unit["batch_id"],
            serial_number=unit["serial_number"],
            status=unit["status"],
            created_at=unit["created_at"],
            blockchain_tx_id=unit.get("blockchain_tx_id")
        )
