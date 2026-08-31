from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import StatisticsResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/statistics", tags=["Dashboard & Analytics"])


@router.get("", response_model=StatisticsResponse)
def get_statistics(db: Session = Depends(get_db)):
    """Retrieve comprehensive waste classification statistics, trends, and distributions."""
    return analytics_service.get_dashboard_statistics(db)
