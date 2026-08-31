import os
from typing import Optional, List, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_

from app.models.record import ClassificationRecord, DetectedObjectRecord
from app.schemas.prediction import (
    DetectedObject,
    BoundingBox,
    HistoryItemResponse,
    HistoryListResponse
)
from app.services.disposal_rules import disposal_rules_service
from app.core.config import settings


class HistoryService:
    """Service handling CRUD, filtering, pagination, and file cleanup for classification history."""

    @staticmethod
    def get_records(
        db: Session,
        page: int = 1,
        limit: int = 10,
        category: Optional[str] = None,
        search: Optional[str] = None,
        recyclable_only: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> HistoryListResponse:
        """Fetch paginated, filtered, and sorted classification records."""
        query = db.query(ClassificationRecord)

        # 1. Category filter
        if category and category.lower() != "all":
            query = query.filter(ClassificationRecord.primary_category == category)

        # 2. Recyclability filter (joined on detected objects)
        if recyclable_only is not None:
            query = query.join(ClassificationRecord.objects).filter(
                DetectedObjectRecord.recyclable == recyclable_only
            ).distinct()

        # 3. Search filter
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.join(ClassificationRecord.objects).filter(
                or_(
                    ClassificationRecord.primary_category.ilike(term),
                    DetectedObjectRecord.object_name.ilike(term),
                    DetectedObjectRecord.recommended_bin.ilike(term)
                )
            ).distinct()

        # Total matching records count
        total = query.count()

        # 4. Sorting
        order_col = getattr(ClassificationRecord, sort_by, ClassificationRecord.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(order_col))
        else:
            query = query.order_by(desc(order_col))

        # 5. Pagination
        offset = (page - 1) * limit
        records = query.offset(offset).limit(limit).all()

        # Map to Pydantic responses
        items = []
        for r in records:
            detected_objs = []
            for obj in r.objects:
                disposal_info = disposal_rules_service.get_recommendation(obj.object_name, obj.category)
                detected_objs.append(DetectedObject(
                    object_id=obj.id,
                    label=obj.object_name,
                    category=obj.category,
                    confidence=obj.confidence,
                    bounding_box=BoundingBox(
                        x1=obj.bbox_x1,
                        y1=obj.bbox_y1,
                        x2=obj.bbox_x2,
                        y2=obj.bbox_y2
                    ),
                    disposal_info=disposal_info,
                    explanation=obj.explanation or ""
                ))

            orig_url = f"/uploads/original/{r.original_image_filename}" if r.original_image_filename else None
            annot_url = f"/uploads/annotated/{r.annotated_image_filename}" if r.annotated_image_filename else None

            items.append(HistoryItemResponse(
                id=r.id,
                created_at=r.created_at,
                original_image_url=orig_url,
                annotated_image_url=annot_url,
                total_objects=r.total_objects,
                primary_category=r.primary_category,
                average_confidence=round(r.average_confidence, 4),
                inference_time_ms=r.inference_time_ms,
                model_mode=r.model_mode,
                source=r.source or "upload",
                objects=detected_objs
            ))

        return HistoryListResponse(
            total=total,
            page=page,
            limit=limit,
            items=items
        )

    @staticmethod
    def get_record_by_id(db: Session, record_id: str) -> Optional[HistoryItemResponse]:
        """Fetch single classification record details by ID."""
        r = db.query(ClassificationRecord).filter(ClassificationRecord.id == record_id).first()
        if not r:
            return None

        detected_objs = []
        for obj in r.objects:
            disposal_info = disposal_rules_service.get_recommendation(obj.object_name, obj.category)
            detected_objs.append(DetectedObject(
                object_id=obj.id,
                label=obj.object_name,
                category=obj.category,
                confidence=obj.confidence,
                bounding_box=BoundingBox(
                    x1=obj.bbox_x1,
                    y1=obj.bbox_y1,
                    x2=obj.bbox_x2,
                    y2=obj.bbox_y2
                ),
                disposal_info=disposal_info,
                explanation=obj.explanation or ""
            ))

        orig_url = f"/uploads/original/{r.original_image_filename}" if r.original_image_filename else None
        annot_url = f"/uploads/annotated/{r.annotated_image_filename}" if r.annotated_image_filename else None

        return HistoryItemResponse(
            id=r.id,
            created_at=r.created_at,
            original_image_url=orig_url,
            annotated_image_url=annot_url,
            total_objects=r.total_objects,
            primary_category=r.primary_category,
            average_confidence=round(r.average_confidence, 4),
            inference_time_ms=r.inference_time_ms,
            model_mode=r.model_mode,
            source=r.source or "upload",
            objects=detected_objs
        )

    @staticmethod
    def delete_record(db: Session, record_id: str) -> bool:
        """Delete classification record and remove its stored image files."""
        r = db.query(ClassificationRecord).filter(ClassificationRecord.id == record_id).first()
        if not r:
            return False

        # Remove image files from disk if they exist
        if r.original_image_filename:
            orig_path = os.path.join(settings.UPLOAD_DIR, "original", r.original_image_filename)
            if os.path.exists(orig_path):
                try:
                    os.remove(orig_path)
                except Exception:
                    pass

        if r.annotated_image_filename:
            annot_path = os.path.join(settings.UPLOAD_DIR, "annotated", r.annotated_image_filename)
            if os.path.exists(annot_path):
                try:
                    os.remove(annot_path)
                except Exception:
                    pass

        db.delete(r)
        db.commit()
        return True


history_service = HistoryService()
