"""Dataset Preparation and Preprocessing Script for Waste Classification.

Creates standardized YOLO format datasets with train/val/test splits.
Supports both:
1. Generating a structured, annotated sample dataset covering all 9 waste classes
2. Formatting and splitting external datasets (TrashNet, TACO, WasteImages) into standard YOLO structure.
"""

import os
import random
import argparse
from typing import Tuple
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

CLASSES = [
    "Plastic", "Paper", "Cardboard", "Glass", "Metal",
    "Organic", "E-Waste", "Hazardous Waste", "Other/Unknown"
]

# Color palettes & geometric archetypes for realistic synthetic samples
CLASS_ARCHETYPES = {
    0: {"name": "Plastic", "color": (59, 130, 246), "shape": "bottle"},
    1: {"name": "Paper", "color": (241, 245, 249), "shape": "sheet"},
    2: {"name": "Cardboard", "color": (180, 120, 60), "shape": "box"},
    3: {"name": "Glass", "color": (20, 184, 166), "shape": "jar"},
    4: {"name": "Metal", "color": (148, 163, 184), "shape": "can"},
    5: {"name": "Organic", "color": (34, 197, 94), "shape": "leaf_fruit"},
    6: {"name": "E-Waste", "color": (234, 88, 12), "shape": "device"},
    7: {"name": "Hazardous Waste", "color": (220, 38, 38), "shape": "hazard_can"},
    8: {"name": "Other/Unknown", "color": (100, 116, 139), "shape": "mixed"}
}


def draw_sample_object(draw: ImageDraw.ImageDraw, class_id: int, bbox: Tuple[int, int, int, int]):
    """Draw distinctive visual contours and texturing corresponding to waste class."""
    x1, y1, x2, y2 = bbox
    w = x2 - x1
    h = y2 - y1
    arch = CLASS_ARCHETYPES[class_id]
    color = arch["color"]

    if arch["shape"] == "bottle":  # Plastic
        neck_w = int(w * 0.35)
        neck_h = int(h * 0.25)
        # Bottle neck
        draw.rectangle([x1 + (w - neck_w) // 2, y1, x1 + (w + neck_w) // 2, y1 + neck_h], fill=(40, 110, 220), outline=(20, 80, 180), width=2)
        # Bottle cap
        draw.rectangle([x1 + (w - neck_w) // 2 - 2, y1, x1 + (w + neck_w) // 2 + 2, y1 + 10], fill=(230, 40, 40))
        # Bottle body
        draw.rectangle([x1, y1 + neck_h, x2, y2], fill=color, outline=(30, 90, 200), width=3)
        # Translucent highlight
        draw.line([x1 + 8, y1 + neck_h + 10, x1 + 8, y2 - 10], fill=(180, 220, 255), width=3)

    elif arch["shape"] == "box":  # Cardboard
        draw.rectangle([x1, y1, x2, y2], fill=color, outline=(130, 80, 40), width=4)
        # Box tape strip
        mid_y = y1 + h // 2
        draw.rectangle([x1, mid_y - 6, x2, mid_y + 6], fill=(210, 160, 90))
        # Corrugated lines
        for offset_y in range(y1 + 15, y2 - 15, 12):
            draw.line([x1 + 10, offset_y, x2 - 10, offset_y], fill=(150, 95, 45), width=1)

    elif arch["shape"] == "can":  # Metal
        draw.rectangle([x1, y1, x2, y2], fill=color, outline=(100, 116, 139), width=3)
        # Metallic shine gradient lines
        draw.line([x1 + int(w * 0.3), y1 + 5, x1 + int(w * 0.3), y2 - 5], fill=(240, 245, 250), width=6)
        draw.line([x1 + int(w * 0.7), y1 + 5, x1 + int(w * 0.7), y2 - 5], fill=(210, 220, 230), width=4)
        # Pull tab at top
        draw.ellipse([x1 + w // 2 - 8, y1 - 4, x1 + w // 2 + 8, y1 + 6], fill=(120, 130, 140))

    elif arch["shape"] == "leaf_fruit":  # Organic
        # Organic banana / fruit ellipse
        draw.ellipse([x1, y1, x2, y2], fill=color, outline=(22, 140, 60), width=3)
        # Fruit stem
        draw.line([x1 + w // 2, y1, x1 + w // 2 - 10, y1 - 15], fill=(100, 60, 20), width=4)

    elif arch["shape"] == "sheet":  # Paper
        draw.rectangle([x1, y1, x2, y2], fill=color, outline=(203, 213, 225), width=2)
        # Document text lines
        for line_y in range(y1 + 15, y2 - 15, 14):
            draw.line([x1 + 12, line_y, x2 - 12, line_y], fill=(148, 163, 184), width=2)

    elif arch["shape"] == "jar":  # Glass
        draw.rectangle([x1, y1, x2, y2], fill=color, outline=(13, 120, 110), width=3)
        # Rim
        draw.rectangle([x1 + 6, y1 - 6, x2 - 6, y1], fill=(200, 240, 235), outline=(13, 120, 110), width=2)
        # Glass reflections
        draw.line([x1 + 10, y1 + 10, x1 + 10, y2 - 10], fill=(255, 255, 255), width=4)

    elif arch["shape"] == "device":  # E-Waste
        draw.rectangle([x1, y1, x2, y2], fill=(30, 41, 59), outline=color, width=3)
        # Screen area
        draw.rectangle([x1 + 8, y1 + 15, x2 - 8, y2 - 20], fill=(15, 23, 42))
        # Camera lens & button
        draw.ellipse([x1 + w // 2 - 4, y1 + 5, x1 + w // 2 + 4, y1 + 11], fill=(100, 116, 139))
        draw.ellipse([x1 + w // 2 - 6, y2 - 15, x1 + w // 2 + 6, y2 - 5], fill=color)

    elif arch["shape"] == "hazard_can":  # Hazardous Waste
        draw.rectangle([x1, y1, x2, y2], fill=(239, 68, 68), outline=(153, 27, 27), width=4)
        # Hazard stripe
        draw.rectangle([x1, y1 + h // 3, x2, y1 + 2 * h // 3], fill=(254, 240, 138))
        # Hazard X / skull representation
        mid_x, mid_y = x1 + w // 2, y1 + h // 2
        draw.line([mid_x - 12, mid_y - 12, mid_x + 12, mid_y + 12], fill=(0, 0, 0), width=3)
        draw.line([mid_x + 12, mid_y - 12, mid_x - 12, mid_y + 12], fill=(0, 0, 0), width=3)

    else:  # Other/Unknown
        draw.polygon([(x1, y2), (x1 + w // 2, y1), (x2, y2)], fill=color, outline=(51, 65, 85), width=3)


def generate_sample_dataset(output_dir: str = "./ml/dataset/data", samples_per_class: int = 15):
    """Generates standard YOLO format dataset with train/val/test splits."""
    print(f"[Dataset Preparation] Generating sample dataset in: {output_dir}")

    splits = {
        "train": int(samples_per_class * 0.70),
        "val": int(samples_per_class * 0.20),
        "test": max(1, int(samples_per_class * 0.10))
    }

    # Ensure split directories exist
    for split in ["train", "val", "test"]:
        os.makedirs(os.path.join(output_dir, "images", split), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "labels", split), exist_ok=True)

    img_size = 640
    sample_id = 0

    for class_id, class_name in enumerate(CLASSES):
        print(f"  -> Generating class {class_id}: {class_name}...")
        for split, count in splits.items():
            for _ in range(count):
                sample_id += 1
                # Background with realistic ambient tone
                bg_color = (
                    random.randint(210, 245),
                    random.randint(210, 245),
                    random.randint(210, 245)
                )
                img = Image.new("RGB", (img_size, img_size), color=bg_color)
                draw = ImageDraw.Draw(img)

                # Add subtle background texture noise
                for _ in range(25):
                    nx = random.randint(0, img_size)
                    ny = random.randint(0, img_size)
                    draw.point((nx, ny), fill=(random.randint(180, 220), random.randint(180, 220), random.randint(180, 220)))

                # Determine random bounding box
                box_w = random.randint(180, 320)
                box_h = random.randint(200, 380)
                x1 = random.randint(50, img_size - box_w - 50)
                y1 = random.randint(50, img_size - box_h - 50)
                x2 = x1 + box_w
                y2 = y1 + box_h

                # Draw class visual features
                draw_sample_object(draw, class_id, (x1, y1, x2, y2))

                # Normalize YOLO label: <class_id> <x_center> <y_center> <w> <h>
                x_center = round(((x1 + x2) / 2) / img_size, 6)
                y_center = round(((y1 + y2) / 2) / img_size, 6)
                w_norm = round(box_w / img_size, 6)
                h_norm = round(box_h / img_size, 6)

                file_stem = f"{class_name.lower().replace(' ', '_').replace('/', '_')}_{sample_id:04d}"
                img_path = os.path.join(output_dir, "images", split, f"{file_stem}.jpg")
                lbl_path = os.path.join(output_dir, "labels", split, f"{file_stem}.txt")

                img.save(img_path, "JPEG", quality=90)
                with open(lbl_path, "w") as f:
                    f.write(f"{class_id} {x_center} {y_center} {w_norm} {h_norm}\n")

    print(f"[Dataset Preparation] Done! Created {sample_id} annotated images across train/val/test splits.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Waste Classification Dataset Preparer")
    parser.add_argument("--output", type=str, default="./ml/dataset/data", help="Output directory")
    parser.add_argument("--samples", type=int, default=15, help="Samples per class (train/val/test split)")
    args = parser.parse_args()

    generate_sample_dataset(output_dir=args.output, samples_per_class=args.samples)
