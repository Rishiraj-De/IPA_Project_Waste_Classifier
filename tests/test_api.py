import io
import base64
import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw

from app.main import app
from app.database.session import Base, engine

# Ensure DB tables exist for tests
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def get_dummy_waste_image_bytes() -> bytes:
    """Creates a synthetic test image with high visual contrast and an object."""
    img = Image.new("RGB", (320, 320), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    # Draw blue bottle shape
    draw.rectangle([100, 80, 220, 260], fill=(37, 99, 235), outline=(29, 78, 216), width=3)
    draw.rectangle([130, 40, 190, 80], fill=(37, 99, 235))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "service" in data
    assert "model" in data
    assert "database" in data


def test_categories_endpoint():
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["total_categories"] >= 9
    categories = [c["category"] for c in data["categories"]]
    assert "Plastic" in categories
    assert "Organic" in categories
    assert "E-Waste" in categories


def test_disposal_rules_endpoint():
    response = client.get("/api/v1/disposal-rules")
    assert response.status_code == 200
    data = response.json()
    assert "rules" in data
    assert len(data["rules"]) >= 9


def test_statistics_endpoint():
    response = client.get("/api/v1/statistics")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "total_items_detected" in data
    assert "category_distribution" in data
    assert "daily_trends" in data
    assert "confidence_histogram" in data


def test_history_empty_or_populated():
    response = client.get("/api/v1/history?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)


def test_predict_image_upload():
    img_bytes = get_dummy_waste_image_bytes()
    files = {"file": ("test_waste.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/v1/predict/image", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "record_id" in data
    assert "total_objects" in data
    assert "primary_category" in data
    assert "inference_time_ms" in data
    assert "objects" in data
    assert len(data["objects"]) >= 1

    first_obj = data["objects"][0]
    assert "label" in first_obj
    assert "category" in first_obj
    assert "confidence" in first_obj
    assert "bounding_box" in first_obj
    assert "disposal_info" in first_obj
    assert "explanation" in first_obj


def test_predict_frame_base64():
    img_bytes = get_dummy_waste_image_bytes()
    b64_str = base64.b64encode(img_bytes).decode("utf-8")
    payload = {
        "image_base64": f"data:image/jpeg;base64,{b64_str}",
        "confidence_threshold": 0.40,
        "save_record": False
    }
    response = client.post("/api/v1/predict/frame", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "total_objects" in data
    assert "primary_category" in data
    assert "inference_time_ms" in data
    assert len(data["objects"]) >= 1
