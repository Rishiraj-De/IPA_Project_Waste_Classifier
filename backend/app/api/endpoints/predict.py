import base64
import io
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from PIL import Image

from app.core.config import settings
from app.database.session import get_db
from app.models.record import ClassificationRecord, DetectedObjectRecord
from app.schemas.prediction import (
    PredictionResponse,
    FramePredictionRequest
)
from app.services.image_processor import image_processor
from app.ml.engine import inference_engine

router = APIRouter(prefix="/predict", tags=["Prediction & Computer Vision"])


@router.post("/image", response_model=PredictionResponse)
async def predict_image(
    file: UploadFile = File(...),
    enhance_contrast: bool = Form(False),
    confidence_threshold: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    """Analyze uploaded waste image using Computer Vision and generate smart disposal recommendations."""
    # 1. Read and validate raw bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    is_valid, err_msg = image_processor.validate_image_file(contents, file.filename or "image.jpg")
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

    # 2. Preprocess image (EXIF orientation, RGB conversion, enhancement)
    orig_pil, processed_pil = image_processor.load_and_preprocess_image(
        contents, enhance=enhance_contrast or settings.ENABLE_IMAGE_ENHANCEMENT
    )

    # 3. Execute ML Inference
    detected_objs, inf_time_ms, is_low_conf, warning_msg = inference_engine.predict(
        processed_pil, confidence_threshold=confidence_threshold
    )

    # 4. Generate visual bounding boxes on image
    annotated_pil = image_processor.draw_bounding_boxes(
        orig_pil, detected_objs, show_labels=True, show_confidences=True
    )

    # 5. Persist images to storage
    orig_filename, annot_filename = image_processor.save_image_pair(orig_pil, annotated_pil)

    # 6. Determine primary category and summary stats
    primary_category = "Other/Unknown"
    avg_conf = 0.0
    if detected_objs:
        avg_conf = sum(o.confidence for o in detected_objs) / len(detected_objs)
        # Select highest confidence object's category
        primary_category = max(detected_objs, key=lambda x: x.confidence).category

    # 7. Persist to Database for History & Analytics
    db_record = ClassificationRecord(
        original_image_filename=orig_filename,
        annotated_image_filename=annot_filename,
        total_objects=len(detected_objs),
        primary_category=primary_category,
        average_confidence=avg_conf,
        inference_time_ms=inf_time_ms,
        model_mode=inference_engine.model_mode,
        is_low_confidence=is_low_conf,
        source="upload"
    )
    db.add(db_record)
    db.flush()  # Populates db_record.id

    for obj in detected_objs:
        db_obj = DetectedObjectRecord(
            record_id=db_record.id,
            object_name=obj.label,
            category=obj.category,
            confidence=obj.confidence,
            bbox_x1=obj.bounding_box.x1,
            bbox_y1=obj.bounding_box.y1,
            bbox_x2=obj.bounding_box.x2,
            bbox_y2=obj.bounding_box.y2,
            recyclable=obj.disposal_info.recyclable,
            recommended_bin=obj.disposal_info.recommended_bin,
            disposal_method=obj.disposal_info.disposal_method,
            explanation=obj.explanation
        )
        db.add(db_obj)

    db.commit()
    db.refresh(db_record)

    return PredictionResponse(
        record_id=db_record.id,
        timestamp=db_record.created_at,
        total_objects=len(detected_objs),
        primary_category=primary_category,
        average_confidence=round(avg_conf, 4),
        inference_time_ms=inf_time_ms,
        model_mode=inference_engine.model_mode,
        is_low_confidence=is_low_conf,
        warning_message=warning_msg,
        annotated_image_url=f"/uploads/annotated/{annot_filename}",
        original_image_url=f"/uploads/original/{orig_filename}",
        objects=detected_objs
    )


@router.post("/frame", response_model=PredictionResponse)
async def predict_frame(
    request: FramePredictionRequest,
    db: Session = Depends(get_db)
):
    """Analyze real-time camera snapshot frame encoded in Base64."""
    # 1. Decode base64 payload
    try:
        raw_b64 = request.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        image_bytes = base64.b64decode(raw_b64)
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Base64 frame data: {str(e)}"
        )

    # 2. Execute inference
    detected_objs, inf_time_ms, is_low_conf, warning_msg = inference_engine.predict(
        pil_img, confidence_threshold=request.confidence_threshold
    )

    primary_category = "Other/Unknown"
    avg_conf = 0.0
    if detected_objs:
        avg_conf = sum(o.confidence for o in detected_objs) / len(detected_objs)
        primary_category = max(detected_objs, key=lambda x: x.confidence).category

    record_id = None
    annot_url = None
    orig_url = None

    # 3. Conditionally persist if user clicked 'Capture / Save to History'
    if request.save_record:
        annotated_pil = image_processor.draw_bounding_boxes(
            pil_img, detected_objs, show_labels=True, show_confidences=True
        )
        orig_filename, annot_filename = image_processor.save_image_pair(pil_img, annotated_pil)
        orig_url = f"/uploads/original/{orig_filename}"
        annot_url = f"/uploads/annotated/{annot_filename}"

        db_record = ClassificationRecord(
            original_image_filename=orig_filename,
            annotated_image_filename=annot_filename,
            total_objects=len(detected_objs),
            primary_category=primary_category,
            average_confidence=avg_conf,
            inference_time_ms=inf_time_ms,
            model_mode=inference_engine.model_mode,
            is_low_confidence=is_low_conf,
            source="camera"
        )
        db.add(db_record)
        db.flush()

        for obj in detected_objs:
            db_obj = DetectedObjectRecord(
                record_id=db_record.id,
                object_name=obj.label,
                category=obj.category,
                confidence=obj.confidence,
                bbox_x1=obj.bounding_box.x1,
                bbox_y1=obj.bounding_box.y1,
                bbox_x2=obj.bounding_box.x2,
                bbox_y2=obj.bounding_box.y2,
                recyclable=obj.disposal_info.recyclable,
                recommended_bin=obj.disposal_info.recommended_bin,
                disposal_method=obj.disposal_info.disposal_method,
                explanation=obj.explanation
            )
            db.add(db_obj)

        db.commit()
        record_id = db_record.id

    return PredictionResponse(
        record_id=record_id,
        total_objects=len(detected_objs),
        primary_category=primary_category,
        average_confidence=round(avg_conf, 4),
        inference_time_ms=inf_time_ms,
        model_mode=inference_engine.model_mode,
        is_low_confidence=is_low_conf,
        warning_message=warning_msg,
        annotated_image_url=annot_url,
        original_image_url=orig_url,
        objects=detected_objs
    )
