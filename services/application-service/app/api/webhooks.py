from fastapi import APIRouter, Header, HTTPException, status, Depends
from typing import Dict, Any
from app.config import settings
from app.clients import get_data_client

router = APIRouter(prefix="/internal/webhooks", tags=["webhooks"])

def verify_webhook_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format")
    token = authorization.split(" ")[1]
    if token != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid internal API key")
    return token

@router.post("/fabric")
async def receive_fabric_event(payload: Dict[str, Any], token: str = Depends(verify_webhook_token)):
    """
    Receives Fabric events from D2 Gateway and forwards them to D1 Data Service.
    Expected payload example:
    {
        "transaction_id": "...",
        "block_number": 12,
        "event_name": "BATCH_REGISTERED",
        "payload": { ... },
        "emitted_at": "..."
    }
    """
    # 1. Map Gateway payload to D1 EventCreate schema
    # As per D1 API: {"type", "actor_org_id", "actor_user_id", "target_id", "state_before", "state_after", "fabric_tx_id", "timestamp"}
    # The webhook from Gateway doesn't have actor_user_id and actor_org_id natively in the event wrapper unless they are in the payload.
    # From the D2_D3_handoff.md:
    # "payload": { "batchId": "...", "currentCustodian": "Org1MSP", "currentState": "REGISTERED", "productId": "...", "createdAt": "..." }
    
    event_name = payload.get("event_name", "UNKNOWN")
    fabric_tx_id = payload.get("transaction_id", "UNKNOWN_TX")
    event_payload = payload.get("payload", {})
    timestamp = payload.get("emitted_at")
    block_number = payload.get("block_number")
    
    # We must forward this to D1 DataServiceClient
    data_client = get_data_client()
    
    target_id = (
        event_payload.get("batch_id") or 
        event_payload.get("product_id") or 
        event_payload.get("unit_id") or 
        event_payload.get("incident_id")
    )
    
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not derive target_id from event payload. Valid identifiers (batch_id, product_id, etc.) are missing."
        )
    
    # A generic event mapping
    # Since D1 DataServiceClient does not have an endpoint to resolve MSP string to Org UUID,
    # we use the official System Org and User identities specifically seeded in D1 for async background tasks.
    SYSTEM_UUID = "00000000-0000-0000-0000-000000000000"
    
    metadata = {k: v for k, v in event_payload.items() if k not in ["latitude", "longitude", "location_name", "batch_id", "product_id"]}

    mapped_event = {
        "type": event_name,
        "actor_org_id": SYSTEM_UUID,
        "actor_user_id": SYSTEM_UUID,
        "target_id": target_id,
        "state_before": None,  # Not provided by Fabric chaincode events
        "state_after": event_payload.get("state"),
        "fabric_tx_id": fabric_tx_id,
        "timestamp": timestamp,
        "latitude": event_payload.get("latitude"),
        "longitude": event_payload.get("longitude"),
        "location_name": event_payload.get("location_name"),
        "block_number": block_number,
        "metadata": metadata
    }
    
    try:
        await data_client.save_event(mapped_event)
    except Exception as e:
        # D1 might return 409 Conflict if duplicate transaction (idempotency handled by D1)
        # We must swallow 409 and return 200 OK so Gateway doesn't retry
        if hasattr(e, "response") and e.response.status_code == 409:
            return {"status": "success", "message": "Duplicate event ignored"}
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"status": "success", "message": "Event forwarded to D1 successfully"}
