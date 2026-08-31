import io
import os
import uuid
from typing import Tuple, List, Optional
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageEnhance
import numpy as np

from app.core.config import settings
from app.schemas.prediction import DetectedObject


# Color scheme mapped to categories for visual bounding boxes
CATEGORY_COLORS = {
    "Plastic": "#2563EB",       # Blue
    "Paper": "#0284C7",         # Sky Blue
    "Cardboard": "#D97706",     # Amber
    "Glass": "#0D9488",         # Teal
    "Metal": "#64748B",         # Slate
    "Organic": "#16A34A",       # Emerald Green
    "E-Waste": "#EA580C",       # Orange
    "Hazardous Waste": "#DC2626", # Red
    "Other/Unknown": "#475569"  # Gray
}


class ImageProcessorService:
    """Image validation, preprocessing, enhancement, and annotation overlay service."""

    @staticmethod
    def validate_image_file(file_bytes: bytes, filename: str) -> Tuple[bool, Optional[str]]:
        """Validate image extension, size, and integrity."""
        # 1. Size check
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(file_bytes) > max_bytes:
            return False, f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."

        if len(file_bytes) < 100:
            return False, "File is too small or empty."

        # 2. Extension check
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in settings.ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}."

        # 3. Format integrity check using PIL
        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                img.verify()
        except Exception:
            return False, "Corrupted or invalid image file."

        return True, None

    @staticmethod
    def load_and_preprocess_image(file_bytes: bytes, enhance: bool = False) -> Tuple[Image.Image, Image.Image]:
        """Load image, correct EXIF orientation, convert to RGB, and optionally enhance contrast."""
        img = Image.open(io.BytesIO(file_bytes))

        # Correct EXIF rotation if captured from mobile/camera
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass

        img_rgb = img.convert("RGB")
        processed_img = img_rgb.copy()

        if enhance:
            # 1. Gentle contrast enhancement
            enhancer = ImageEnhance.Contrast(processed_img)
            processed_img = enhancer.enhance(1.15)
            # 2. Gentle sharpness adjustment
            sharpener = ImageEnhance.Sharpness(processed_img)
            processed_img = sharpener.enhance(1.2)

        return img_rgb, processed_img

    @staticmethod
    def draw_bounding_boxes(
        image: Image.Image,
        detections: List[DetectedObject],
        show_labels: bool = True,
        show_confidences: bool = True
    ) -> Image.Image:
        """Draw bounding boxes and metadata badges onto image copy."""
        annotated = image.copy()
        draw = ImageDraw.Draw(annotated)
        width, height = annotated.size

        # Try to use a clean system font, fallback to default font
        font = None
        font_size = max(14, int(height * 0.025))
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except Exception:
            try:
                font = ImageFont.truetype("DejaVuSans.ttf", font_size)
            except Exception:
                font = ImageFont.load_default()

        for det in detections:
            bbox = det.bounding_box
            # Denormalize coordinates to pixels
            x1 = int(bbox.x1 * width)
            y1 = int(bbox.y1 * height)
            x2 = int(bbox.x2 * width)
            y2 = int(bbox.y2 * height)

            # Clamp coordinates
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(width, x2), min(height, y2)

            color_hex = CATEGORY_COLORS.get(det.category, "#2563EB")

            # Draw outer rectangle box with thickness
            line_width = max(3, int(width * 0.004))
            draw.rectangle([x1, y1, x2, y2], outline=color_hex, width=line_width)

            # Build label text
            parts = []
            if show_labels:
                parts.append(det.label)
            if show_confidences:
                parts.append(f"{int(det.confidence * 100)}%")
            label_text = " | ".join(parts) if parts else det.label

            if label_text:
                # Text bounding box measurement
                try:
                    text_bbox = draw.textbbox((x1, y1), label_text, font=font)
                    text_w = text_bbox[2] - text_bbox[0]
                    text_h = text_bbox[3] - text_bbox[1]
                except Exception:
                    text_w, text_h = 100, 20

                padding = 6
                badge_y1 = max(0, y1 - text_h - padding * 2)
                badge_y2 = y1 if y1 - text_h - padding * 2 >= 0 else y1 + text_h + padding * 2
                badge_x2 = min(width, x1 + text_w + padding * 2)

                # Draw filled badge background
                draw.rectangle([x1, badge_y1, badge_x2, badge_y2], fill=color_hex)
                # Draw text in crisp white
                draw.text((x1 + padding, badge_y1 + padding // 2), label_text, fill="white", font=font)

        return annotated

    @staticmethod
    def save_image_pair(
        original_image: Image.Image,
        annotated_image: Image.Image
    ) -> Tuple[str, str]:
        """Save original and annotated images to uploads directory with unique UUIDs.
        Returns filenames (original_filename, annotated_filename).
        """
        scan_uuid = str(uuid.uuid4())
        orig_filename = f"{scan_uuid}_orig.jpg"
        annot_filename = f"{scan_uuid}_annot.jpg"

        orig_path = os.path.join(settings.UPLOAD_DIR, "original", orig_filename)
        annot_path = os.path.join(settings.UPLOAD_DIR, "annotated", annot_filename)

        original_image.save(orig_path, "JPEG", quality=90)
        annotated_image.save(annot_path, "JPEG", quality=90)

        return orig_filename, annot_filename


image_processor = ImageProcessorService()
