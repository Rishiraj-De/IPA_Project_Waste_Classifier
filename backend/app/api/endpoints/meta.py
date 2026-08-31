import os
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db
from app.services.disposal_rules import disposal_rules_service
from app.ml.engine import inference_engine, SUPPORTED_CATEGORIES
from app.core.config import settings

router = APIRouter(tags=["Metadata & System Health"])

START_TIME = time.time()


@router.get("/categories")
def get_supported_categories():
    """List all supported waste categories, associated bin colors, and recyclability."""
    return {
        "total_categories": len(SUPPORTED_CATEGORIES),
        "categories": disposal_rules_service.get_all_categories()
    }


@router.get("/disposal-rules")
def get_all_disposal_rules():
    """Retrieve full database of configurable disposal recommendation rules."""
    return {
        "rules": disposal_rules_service.get_all_categories()
    }


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Comprehensive system health check: DB status, ML model status, directory permissions."""
    # Test DB query
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    custom_weights_exist = os.path.exists(settings.MODEL_WEIGHTS_PATH)

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "database": {
            "status": "connected" if db_ok else "error",
            "dialect": settings.DATABASE_URL.split("://")[0]
        },
        "model": {
            "mode": inference_engine.model_mode,
            "name": inference_engine.model_name,
            "confidence_threshold": settings.CONFIDENCE_THRESHOLD,
            "custom_weights_present": custom_weights_exist
        },
        "storage": {
            "upload_dir": settings.UPLOAD_DIR,
            "writable": os.access(settings.UPLOAD_DIR, os.W_OK)
        }
    }
