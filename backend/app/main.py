import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import engine, Base
from app.api.endpoints import predict_router, history_router, statistics_router, meta_router

# Configure clean structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("smart_waste.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle events: initialize DB tables and prepare directories."""
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database schemas ready ({settings.DATABASE_URL.split('://')[0]}).")

    # Ensure uploads directory structure exists
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "original"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "annotated"), exist_ok=True)
    yield
    logger.info("Shutting down Smart Waste Classifier API.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
## AI Smart Waste Classification & Segregation System REST API

Automates the detection, localization, and classification of recyclable and hazardous waste materials using Computer Vision and deep learning (YOLOv8).
Generates contextual disposal methods and designated bin recommendations.

### Features
* **Object Detection & Classification**: High accuracy waste recognition with bounding box localization.
* **Smart Recommendation Engine**: Rules-based mapping from material to color-coded bins and prep steps.
* **Dual Capture Modes**: Standard file upload and real-time webcam frame inference.
* **Audit History & Analytics**: Persistent classification database with rich query filters and dashboard statistics.
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory as Static Files for browser preview
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers under standard prefix /api/v1
app.include_router(predict_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(statistics_router, prefix=settings.API_V1_STR)
app.include_router(meta_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Root redirect / welcome message."""
    return {
        "system": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR
    }


# Global Exception Handler (Never expose raw stack traces to users)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An internal server error occurred while processing your request. Please try again or check the image format.",
            "type": exc.__class__.__name__
        }
    )
