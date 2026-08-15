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
    
    # We must forward this to D1 DataServiceClient
    data_client = get_data_client()
    
    # Let's try to infer target_id based on event type
    target_id = event_payload.get("batchId") or event_payload.get("productId") or event_payload.get("incidentId") or event_payload.get("unitId") or "UNKNOWN_TARGET"
    
    # A generic event mapping
    mapped_event = {
        "type": event_name,
        "actor_org_id": event_payload.get("actorOrgId") or "00000000-0000-0000-0000-000000000000", # We may need to pass actual UUIDs if possible, or D1 might accept the MSP string. D1 schema expects UUID4.
        "actor_user_id": event_payload.get("actorUserId") or "00000000-0000-0000-0000-000000000000",
        "target_id": target_id,
        "state_before": event_payload.get("previousState"),
        "state_after": event_payload.get("currentState"),
        "fabric_tx_id": fabric_tx_id,
        "timestamp": timestamp
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
