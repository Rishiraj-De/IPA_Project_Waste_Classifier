"""YOLOv8 Waste Classification & Object Detection Training Pipeline.

Fine-tunes a pretrained YOLOv8 backbone on the custom 9-class waste dataset.
Applies data augmentations (HSV color adjustments, scaling, mosaic, horizontal flips).
Saves final best weights to `ml/models/waste_yolov8_best.pt`.
"""

import os
import shutil
import argparse
from pathlib import Path


def train_waste_detector(
    data_yaml: str = "./ml/dataset/data.yaml",
    base_model: str = "yolov8n.pt",
    epochs: int = 15,
    img_size: int = 640,
    batch_size: int = 8,
    output_model_path: str = "./ml/models/waste_yolov8_best.pt"
):
    print("=" * 70)
    print("AI SMART WASTE CLASSIFIER — YOLOv8 FINE-TUNING PIPELINE")
    print("=" * 70)
    print(f"Data Configuration: {data_yaml}")
    print(f"Base Model:         {base_model}")
    print(f"Epochs:             {epochs}")
    print(f"Image Resolution:   {img_size}x{img_size}")
    print(f"Batch Size:         {batch_size}")
    print(f"Target Output:      {output_model_path}")
    print("-" * 70)

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] 'ultralytics' library is not installed. Please install via: pip install ultralytics")
        return

    # Check if dataset exists
    if not os.path.exists(data_yaml):
        print(f"[ERROR] Dataset configuration not found at {data_yaml}.")
        print("Please run: python ml/dataset/prepare_sample_dataset.py first.")
        return

    # Load base pretrained model
    print(f"[1/4] Initializing base backbone: {base_model}...")
    model = YOLO(base_model)

    # Execute training with transfer learning
    print(f"[2/4] Commencing model training for {epochs} epochs...")
    results = model.train(
        data=os.path.abspath(data_yaml),
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        name="waste_yolov8_run",
        project="ml/training/runs",
        exist_ok=True,
        # Data Augmentations
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        fliplr=0.5,
        mosaic=1.0,
        verbose=True
    )

    print("[3/4] Training concluded successfully!")
    
    # Locate best weights from training run
    best_weights = Path("ml/training/runs/waste_yolov8_run/weights/best.pt")
    last_weights = Path("ml/training/runs/waste_yolov8_run/weights/last.pt")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)

    if best_weights.exists():
        shutil.copy(best_weights, output_model_path)
        print(f"[4/4] Copied best fine-tuned weights to: {output_model_path}")
    elif last_weights.exists():
        shutil.copy(last_weights, output_model_path)
        print(f"[4/4] Copied last checkpoint weights to: {output_model_path}")
    else:
        print("[WARNING] Could not locate trained weights file in runs directory.")

    print("=" * 70)
    print(f"Model ready for inference at: {output_model_path}")
    print("=" * 70)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Custom Waste Detection YOLOv8 Model")
    parser.add_argument("--data", type=str, default="./ml/dataset/data.yaml", help="Path to data.yaml")
    parser.add_argument("--base", type=str, default="yolov8n.pt", help="Pretrained YOLOv8 model")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution")
    parser.add_argument("--batch", type=int, default=4, help="Batch size")
    parser.add_argument("--out", type=str, default="./ml/models/waste_yolov8_best.pt", help="Output weights path")
    args = parser.parse_args()

    train_waste_detector(
        data_yaml=args.data,
        base_model=args.base,
        epochs=args.epochs,
        img_size=args.imgsz,
        batch_size=args.batch,
        output_model_path=args.out
    )
