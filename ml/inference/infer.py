"""Standalone CLI Waste Detection Inference Tool.

Runs object detection and smart waste segregation rules on any target image file or folder.
"""

import os
import argparse
from PIL import Image

from app.services.image_processor import image_processor
from app.ml.engine import inference_engine


def run_cli_inference(source: str, conf: float = 0.50, out_dir: str = "./ml/inference/runs"):
    os.makedirs(out_dir, exist_ok=True)
    print("=" * 65)
    print("AI SMART WASTE CLASSIFIER — CLI INFERENCE UTILITY")
    print("=" * 65)

    if not os.path.exists(source):
        print(f"[ERROR] Source path does not exist: {source}")
        return

    image_paths = []
    if os.path.isdir(source):
        for ext in ["jpg", "jpeg", "png", "webp"]:
            image_paths.extend([os.path.join(source, f) for f in os.listdir(source) if f.lower().endswith(ext)])
    else:
        image_paths = [source]

    print(f"Processing {len(image_paths)} image(s)...")

    for img_path in image_paths:
        print(f"\nAnalyzing: {img_path}")
        with open(img_path, "rb") as f:
            raw_bytes = f.read()

        orig_pil, processed_pil = image_processor.load_and_preprocess_image(raw_bytes, enhance=True)
        detected_objs, inf_time_ms, is_low_conf, warning_msg = inference_engine.predict(
            processed_pil, confidence_threshold=conf
        )

        print(f"  Inference Time: {inf_time_ms} ms | Model Mode: {inference_engine.model_mode}")
        print(f"  Detected Objects: {len(detected_objs)}")

        if is_low_conf and warning_msg:
            print(f"  [WARNING]: {warning_msg}")

        for obj in detected_objs:
            print(f"  --------------------------------------------------")
            print(f"  Object:          {obj.label} ({int(obj.confidence * 100)}%)")
            print(f"  Category:        {obj.category}")
            print(f"  Recyclable:      {'YES' if obj.disposal_info.recyclable else 'NO'}")
            print(f"  Recommended Bin: {obj.disposal_info.recommended_bin} ({obj.disposal_info.bin_badge})")
            print(f"  Method:          {obj.disposal_info.disposal_method}")

        # Save annotated image
        annotated = image_processor.draw_bounding_boxes(orig_pil, detected_objs)
        out_filename = os.path.join(out_dir, f"detected_{os.path.basename(img_path)}")
        annotated.save(out_filename)
        print(f"  Saved visual output to: {out_filename}")

    print("\n" + "=" * 65)
    print("Inference completed.")
    print("=" * 65)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Waste Detection CLI Tool")
    parser.add_argument("--source", type=str, required=True, help="Path to image file or directory")
    parser.add_argument("--conf", type=float, default=0.50, help="Confidence threshold")
    parser.add_argument("--out", type=str, default="./ml/inference/runs", help="Output directory")
    args = parser.parse_args()

    run_cli_inference(source=args.source, conf=args.conf, out_dir=args.out)
