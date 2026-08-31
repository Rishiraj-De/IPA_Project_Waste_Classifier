from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float = Field(..., description="Normalized top-left x (0.0 to 1.0)")
    y1: float = Field(..., description="Normalized top-left y (0.0 to 1.0)")
    x2: float = Field(..., description="Normalized bottom-right x (0.0 to 1.0)")
    y2: float = Field(..., description="Normalized bottom-right y (0.0 to 1.0)")


class DisposalInfo(BaseModel):
    recyclable: bool = Field(..., description="Whether the material is recyclable")
    recyclability_type: str = Field("Recyclable", description="Recyclable, Non-Recyclable, or Hazardous")
    recommended_bin: str = Field(..., description="Target disposal bin name")
    bin_color_hex: str = Field("#3B82F6", description="Recommended color code for the disposal bin")
    bin_badge: str = Field("Blue Bin", description="Colloquial bin badge description")
    disposal_method: str = Field(..., description="High-level disposal action")
    handling_instructions: List[str] = Field(default_factory=list, description="Step-by-step preparation steps")
    hazard_level: str = Field("None", description="Hazard level: None, Low, Moderate, High")
    eco_tip: Optional[str] = Field(None, description="Environmental conservation tip")


class DetectedObject(BaseModel):
    object_id: int
    label: str = Field(..., description="Name of detected object (e.g. 'Plastic Bottle')")
    category: str = Field(..., description="Standardized waste category")
    confidence: float = Field(..., description="Model confidence score between 0.0 and 1.0")
    bounding_box: BoundingBox
    disposal_info: DisposalInfo
    explanation: str = Field(..., description="Model explainability statement")


class PredictionResponse(BaseModel):
    record_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    total_objects: int
    primary_category: str
    average_confidence: float
    inference_time_ms: float
    model_mode: str = Field(..., description="'custom_fine_tuned' or 'pretrained_mapped'")
    is_low_confidence: bool
    warning_message: Optional[str] = None
    annotated_image_url: Optional[str] = None
    original_image_url: Optional[str] = None
    objects: List[DetectedObject] = Field(default_factory=list)


class FramePredictionRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded JPEG or PNG image frame")
    confidence_threshold: Optional[float] = Field(None, ge=0.1, le=1.0)
    save_record: bool = Field(False, description="Whether to persist live frame to database")


class HistoryItemResponse(BaseModel):
    id: str
    created_at: datetime
    original_image_url: Optional[str]
    annotated_image_url: Optional[str]
    total_objects: int
    primary_category: str
    average_confidence: float
    inference_time_ms: float
    model_mode: str
    source: str
    objects: List[DetectedObject] = Field(default_factory=list)

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[HistoryItemResponse]


class CategoryStat(BaseModel):
    category: str
    count: int
    percentage: float
    color: str


class DailyTrendStat(BaseModel):
    date: str
    scans: int
    items_detected: int
    recyclable: int
    non_recyclable: int


class ConfidenceBucket(BaseModel):
    range: str
    count: int


class StatisticsResponse(BaseModel):
    total_scans: int
    total_items_detected: int
    recyclable_count: int
    non_recyclable_count: int
    recyclable_percentage: float
    most_common_category: str
    average_overall_confidence: float
    category_distribution: List[CategoryStat]
    daily_trends: List[DailyTrendStat]
    confidence_histogram: List[ConfidenceBucket]
