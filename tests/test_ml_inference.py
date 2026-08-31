import pytest
from PIL import Image
from app.ml.engine import inference_engine, SUPPORTED_CATEGORIES


def test_inference_engine_initialized():
    assert inference_engine is not None
    assert inference_engine.model_mode in ["custom_fine_tuned", "pretrained_mapped", "fallback_heuristic"]


def test_predict_on_synthetic_image():
    img = Image.new("RGB", (400, 400), color=(180, 140, 90))  # Cardboard-like color
    detections, inf_time, is_low_conf, warning_msg = inference_engine.predict(img)

    assert isinstance(detections, list)
    assert inf_time > 0.0
    if len(detections) > 0:
        det = detections[0]
        assert det.category in SUPPORTED_CATEGORIES
        assert 0.0 <= det.confidence <= 1.0
        assert det.bounding_box.x1 <= det.bounding_box.x2
        assert det.bounding_box.y1 <= det.bounding_box.y2
        assert len(det.explanation) > 10


def test_low_confidence_thresholding():
    img = Image.new("RGB", (400, 400), color=(20, 20, 20))  # Dark image
    # With strict 0.99 threshold, should flag low confidence or return empty
    detections, inf_time, is_low_conf, warning_msg = inference_engine.predict(img, confidence_threshold=0.99)
    assert is_low_conf is True
