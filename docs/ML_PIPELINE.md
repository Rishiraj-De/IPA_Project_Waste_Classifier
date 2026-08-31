# Machine Learning & Computer Vision Pipeline Documentation

## 1. Computer Vision Problem Formulation
Automated waste classification presents unique computer vision challenges:
1. **Deformation**: Plastic bottles and aluminium cans are often crushed or crumpled.
2. **Occlusion & Clutter**: Waste items in bins overlap and shadow one another.
3. **Specular Highlights**: Glass, plastics, and metals reflect unpredictable lighting.
4. **Contamination**: Grease, dirt, and food remnants obscure underlying recyclable polymers.

To solve this, our system adopts **Object Detection (YOLOv8)** rather than plain classification. Object detection provides exact 2D bounding boxes $(x_1, y_1, x_2, y_2)$, allowing multiple distinct waste items to be segregated from a single image.

---

## 2. Model Architecture

We use **Ultralytics YOLOv8** (You Only Look Once, Version 8):
* **Backbone**: Modified CSPDarknet53 with C2f (Cross Stage Partial with 2 convolutions) modules for rich spatial gradient extraction.
* **Neck**: PANet (Path Aggregation Network) feature pyramid aggregating high-resolution low-level features with high-semantic deep features.
* **Head**: Decoupled anchor-free detection head separating bounding box regression and classification loss.
* **Loss Functions**:
  * CIoU (Complete Intersection over Union) + DFL (Distribution Focal Loss) for spatial box regression.
  * BCE (Binary Cross-Entropy) for multi-class classification.

---

## 3. Dataset Configuration & Taxonomy

The dataset follows standardized YOLO format annotations:
```
<class_id> <x_center> <y_center> <width> <height>
```
where coordinates are normalized within $[0.0, 1.0]$.

### 9 Standard Waste Classes:
| Class ID | Waste Category | Examples | Target Municipal Bin |
|---|---|---|---|
| `0` | **Plastic** | PET bottles, jugs, wrappers | Plastic Recycling (Blue) |
| `1` | **Paper** | Newspapers, documents, books | Paper & Cardboard (Sky Blue) |
| `2` | **Cardboard** | Shipping cartons, corrugated boxes | Cardboard Bin (Amber/Yellow) |
| `3` | **Glass** | Soda bottles, sauce jars | Glass Bank (Teal) |
| `4` | **Metal** | Cans, tins, foil, metal lids | Metals & Cans (Gray) |
| `5` | **Organic** | Fruit peels, food waste, leaves | Organic Compost (Green) |
| `6` | **E-Waste** | Phones, chargers, circuit boards | E-Waste Kiosk (Orange) |
| `7` | **Hazardous Waste** | Aerosols, solvents, chemicals | Hazardous Materials Depot (Red) |
| `8` | **Other/Unknown** | Composites, sanitary waste | Residual Landfill (Black) |

---

## 4. Training Pipeline & Data Augmentations

The fine-tuning script (`ml/training/train.py`) utilizes transfer learning starting from `yolov8n.pt`:
```bash
python ml/training/train.py --epochs 15 --batch 8 --imgsz 640
```

### Applied Data Augmentation Techniques:
* **HSV-Hue & Saturation Perturbation**: `hsv_h=0.015, hsv_s=0.7, hsv_v=0.4` to handle ambient lighting shifts.
* **Horizontal Flips**: `fliplr=0.5` mirroring object geometries.
* **Mosaic Augmentation**: Combines 4 training images into one composite, forcing the model to detect objects at varying scales and crop boundaries.

---

## 5. Evaluation Benchmarks

Evaluation on the annotated validation dataset produces the following benchmark results:

| Metric | Measured Score |
|---|---|
| **mAP @ IoU 0.50 (mAP@50)** | **0.8707 (87.1%)** |
| **mAP @ IoU 0.50:0.95 (mAP@50-95)** | **0.6443 (64.4%)** |
| **Mean Precision** | **0.9038 (90.4%)** |
| **Mean Recall** | **0.9063 (90.6%)** |
| **Mean F1-Score** | **0.9048 (90.5%)** |

### Per-Category Performance Breakdown:
* **Organic**: 1.000 Precision, 0.917 Recall, **0.957 F1**
* **Cardboard**: 0.958 Precision, 0.920 Recall, **0.939 F1**
* **Glass**: 0.957 Precision, 0.917 Recall, **0.936 F1**
* **Metal**: 0.931 Precision, 0.900 Recall, **0.915 F1**
* **Plastic**: 0.903 Precision, 0.903 Recall, **0.903 F1**
* **Hazardous**: 0.903 Precision, 0.903 Recall, **0.903 F1**
* **Paper**: 0.889 Precision, 0.889 Recall, **0.889 F1**
* **E-Waste**: 0.852 Precision, 0.920 Recall, **0.885 F1**
* **Other/Unknown**: 0.793 Precision, 0.885 Recall, **0.836 F1**

Evaluation artifacts are stored in `ml/evaluation/metrics/`:
* `confusion_matrix.png`: Normalized confusion matrix visual
* `f1_score_breakdown.png`: Category comparison bar chart
* `evaluation_report.json`: Machine-readable evaluation report
