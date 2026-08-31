from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import HistoryListResponse, HistoryItemResponse
from app.services.history_service import history_service

router = APIRouter(prefix="/history", tags=["History & Audit Log"])


@router.get("", response_model=HistoryListResponse)
def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category (Plastic, Organic, etc.)"),
    search: Optional[str] = Query(None, description="Search term for item label or category"),
    recyclable_only: Optional[bool] = Query(None, description="Filter by recyclable status"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order: 'asc' or 'desc'"),
    db: Session = Depends(get_db)
):
    """Retrieve paginated and filtered classification history."""
    return history_service.get_records(
        db=db,
        page=page,
        limit=limit,
        category=category,
        search=search,
        recyclable_only=recyclable_only,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get("/{record_id}", response_model=HistoryItemResponse)
def get_history_detail(
    record_id: str,
    db: Session = Depends(get_db)
):
    """Retrieve detailed information for a single classification scan."""
    record = history_service.get_record_by_id(db, record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Classification record '{record_id}' not found."
        )
    return record


@router.delete("/{record_id}")
def delete_history_record(
    record_id: str,
    db: Session = Depends(get_db)
):
    """Delete a classification scan and associated stored images."""
    success = history_service.delete_record(db, record_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Classification record '{record_id}' not found."
        )
    return {"status": "success", "message": f"Record {record_id} deleted successfully."}
