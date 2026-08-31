import os
import json
from typing import List, Union, Any
from pydantic import field_validator, ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=True, env_file=".env", extra="allow")

    PROJECT_NAME: str = "AI Smart Waste Classifier & Segregation API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Host & Port
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./waste_classifier.db"

    # ML & Computer Vision
    CONFIDENCE_THRESHOLD: float = 0.45
    MODEL_WEIGHTS_PATH: str = "./ml/models/waste_yolov8_best.pt"
    FALLBACK_MODEL_NAME: str = "yolov8n.pt"
    ENABLE_IMAGE_ENHANCEMENT: bool = True
    TARGET_IMAGE_SIZE: int = 640

    # File Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: Union[str, List[str]] = ["jpg", "jpeg", "png", "webp"]

    @field_validator("ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def assemble_allowed_exts(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [i.strip().lower() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(x).lower() for x in v]
        return ["jpg", "jpeg", "png", "webp"]


settings = Settings()

# Ensure required runtime directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "annotated"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "original"), exist_ok=True)
os.makedirs("./ml/models", exist_ok=True)
