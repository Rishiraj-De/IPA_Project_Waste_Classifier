import io
import pytest
from PIL import Image
from app.services.image_processor import image_processor
from app.schemas.prediction import DetectedObject, BoundingBox, DisposalInfo


def create_test_image_bytes(width=300, height=300, color=(100, 150, 200), fmt="JPEG") -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


def test_validate_valid_image():
    raw_bytes = create_test_image_bytes()
    is_valid, err = image_processor.validate_image_file(raw_bytes, "test.jpg")
    assert is_valid is True
    assert err is None


def test_validate_invalid_extension():
    raw_bytes = create_test_image_bytes()
    is_valid, err = image_processor.validate_image_file(raw_bytes, "document.pdf")
    assert is_valid is False
    assert "Unsupported file extension" in err


def test_validate_corrupted_image():
    corrupted_bytes = b"CORRUPTED_NON_IMAGE_DATA_BYTES_" * 10
    is_valid, err = image_processor.validate_image_file(corrupted_bytes, "bad.jpg")
    assert is_valid is False
    assert "Corrupted or invalid image" in err


def test_load_and_preprocess():
    raw_bytes = create_test_image_bytes(200, 200)
    orig, processed = image_processor.load_and_preprocess_image(raw_bytes, enhance=True)
    assert orig.size == (200, 200)
    assert processed.size == (200, 200)
    assert orig.mode == "RGB"
    assert processed.mode == "RGB"


def test_draw_bounding_boxes():
    img = Image.new("RGB", (400, 400), color=(240, 240, 240))
    detections = [
        DetectedObject(
            object_id=1,
            label="Plastic Bottle",
            category="Plastic",
            confidence=0.94,
            bounding_box=BoundingBox(x1=0.1, y1=0.1, x2=0.5, y2=0.8),
            disposal_info=DisposalInfo(
                recyclable=True,
                recyclability_type="Recyclable",
                recommended_bin="Plastic Recycling",
                bin_color_hex="#2563EB",
                bin_badge="Blue Bin",
                disposal_method="Rinse and recycle",
                handling_instructions=["Rinse thoroughly"],
                hazard_level="None"
            ),
            explanation="Visually consistent with bottle."
        )
    ]
    annotated = image_processor.draw_bounding_boxes(img, detections)
    assert annotated.size == (400, 400)
