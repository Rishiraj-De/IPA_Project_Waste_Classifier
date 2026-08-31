from app.api.endpoints.predict import router as predict_router
from app.api.endpoints.history import router as history_router
from app.api.endpoints.statistics import router as statistics_router
from app.api.endpoints.meta import router as meta_router

__all__ = ["predict_router", "history_router", "statistics_router", "meta_router"]
