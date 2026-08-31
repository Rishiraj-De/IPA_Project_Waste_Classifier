"""Model Validation Script for Waste Detection.

Evaluates YOLO model metrics (mAP50, mAP50-95, Precision, Recall)
on the validation dataset split.
"""

import os
import argparse


def validate_waste_detector(
    weights: str = "./ml/models/waste_yolov8_best.pt",
    data_yaml: str = "./ml/dataset/data.yaml",
    img_size: int = 640
):
    print("=" * 65)
    print("AI SMART WASTE CLASSIFIER — VALIDATION BENCHMARK")
    print("=" * 65)

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] 'ultralytics' library is not installed.")
        return

    # Fallback to pretrained if custom weights not yet generated
    target_weights = weights
    if not os.path.exists(target_weights):
        print(f"[INFO] Weights {weights} not found. Validating base model 'yolov8n.pt'...")
        target_weights = "yolov8n.pt"

    if not os.path.exists(data_yaml):
        print(f"[ERROR] Dataset configuration not found at {data_yaml}.")
        return

    model = YOLO(target_weights)

    print(f"Executing validation on dataset: {data_yaml}...")
    metrics = model.val(
        data=os.path.abspath(data_yaml),
        imgsz=img_size,
        split="val",
        project="ml/validation/runs",
        name="waste_val_run",
        exist_ok=True,
        verbose=True
    )

    print("\n" + "=" * 65)
    print("VALIDATION RESULTS SUMMARY")
    print("=" * 65)
    print(f"Mean Average Precision (mAP@50):    {metrics.box.map50:.4f}")
    print(f"Mean Average Precision (mAP@50-95): {metrics.box.map:.4f}")
    print(f"Mean Precision:                     {metrics.box.mp:.4f}")
    print(f"Mean Recall:                        {metrics.box.mr:.4f}")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate Waste Detection YOLO Model")
    parser.add_argument("--weights", type=str, default="./ml/models/waste_yolov8_best.pt")
    parser.add_argument("--data", type=str, default="./ml/dataset/data.yaml")
    parser.add_argument("--imgsz", type=int, default=640)
    args = parser.parse_args()

    validate_waste_detector(weights=args.weights, data_yaml=args.data, img_size=args.imgsz)
