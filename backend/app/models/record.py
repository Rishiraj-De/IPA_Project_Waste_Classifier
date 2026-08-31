import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base


class ClassificationRecord(Base):
    """Stores metadata for each complete inference run (image or camera snapshot)."""
    __tablename__ = "classification_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    original_image_filename = Column(String(255), nullable=True)
    annotated_image_filename = Column(String(255), nullable=True)
    total_objects = Column(Integer, default=0)
    primary_category = Column(String(64), default="Unknown", index=True)
    average_confidence = Column(Float, default=0.0)
    inference_time_ms = Column(Float, default=0.0)
    model_mode = Column(String(64), default="pretrained_mapped")
    is_low_confidence = Column(Boolean, default=False)
    source = Column(String(32), default="upload")  # "upload" or "camera"

    # Relationships
    objects = relationship("DetectedObjectRecord", back_populates="record", cascade="all, delete-orphan")


class DetectedObjectRecord(Base):
    """Stores each individual object detected in a scan."""
    __tablename__ = "detected_objects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(String(36), ForeignKey("classification_records.id", ondelete="CASCADE"), index=True)
    object_name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    
    # Bounding Box normalized coordinates [0.0 - 1.0]
    bbox_x1 = Column(Float, nullable=False)
    bbox_y1 = Column(Float, nullable=False)
    bbox_x2 = Column(Float, nullable=False)
    bbox_y2 = Column(Float, nullable=False)

    # Disposal recommendation
    recyclable = Column(Boolean, default=False)
    recommended_bin = Column(String(128), nullable=False)
    disposal_method = Column(String(255), nullable=True)
    explanation = Column(Text, nullable=True)

    record = relationship("ClassificationRecord", back_populates="objects")
