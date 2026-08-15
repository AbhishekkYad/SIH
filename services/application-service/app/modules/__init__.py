from app.modules.products import products_router
from app.modules.batches import batches_router
from app.modules.qr import qr_router
from app.modules.feedback import feedback_router
from app.modules.risk import risk_router
from app.modules.recall import recall_router

__all__ = [
    "products_router",
    "batches_router",
    "qr_router",
    "feedback_router",
    "risk_router",
    "recall_router"
]
