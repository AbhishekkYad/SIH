from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import uuid
from app.auth.dependencies import ActorContext
from app.clients import get_data_client, get_blockchain_client
from app.schemas.products import ProductCreate, ProductResponse


class ProductService:
    def __init__(self):
        self.data_client = get_data_client()
        self.bc_client = get_blockchain_client()

    async def create_product(self, payload: ProductCreate, actor: ActorContext) -> ProductResponse:
        # Step 1: Generate Product ID
        product_id = f"prd-{uuid.uuid4().hex[:8]}"
        
        # Step 2: Submit to Blockchain Service (TraceabilityContract.registerProduct)
        tx_result = await self.bc_client.register_product(
            product_id=product_id,
            name=payload.name,
            sku=payload.sku,
            actor_context=actor.dict()
        )
        
        # Step 3: D1 persistence will happen asynchronously via the Fabric Webhook
        from datetime import datetime
        
        return ProductResponse(
            product_id=product_id,
            name=payload.name,
            sku=payload.sku,
            category=payload.category,
            producer_org_id=actor.org_id,
            created_at=datetime.utcnow().isoformat(),
            blockchain_tx_id=tx_result.get("transaction_id")
        )

    async def get_product(self, product_id: str) -> ProductResponse:
        product = await self.data_client.get_product(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product '{product_id}' not found")
        
        return ProductResponse(
            product_id=product["product_id"],
            name=product["name"],
            sku=product["sku"],
            category=product["category"],
            producer_org_id=product["producer_org_id"],
            created_at=product["created_at"],
            blockchain_tx_id=product.get("blockchain_tx_id")
        )
