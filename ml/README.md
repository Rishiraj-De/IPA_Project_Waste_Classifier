# Machine Learning Pipeline & Model Strategy

This directory contains the machine learning, computer vision, training, validation, and evaluation infrastructure for the **AI Smart Waste Classification & Segregation System**.

---

## 1. Supported Waste Categories

The system is configured to localize and classify 9 standard categories:
1. **Plastic** (`0`)
2. **Paper** (`1`)
3. **Cardboard** (`2`)
4. **Glass** (`3`)
5. **Metal** (`4`)
6. **Organic** (`5`)
7. **E-Waste** (`6`)
8. **Hazardous Waste** (`7`)
9. **Other/Unknown** (`8`)

---

## 2. Directory Layout

```
ml/
├── dataset/
│   ├── data.yaml                     # Standard YOLOv8 dataset configuration
│   ├── prepare_sample_dataset.py     # Preprocessing and dataset generator script
│   └── data/                         # Local dataset directory
│       ├── images/ (train, val, test)
│       └── labels/ (train, val, test)
├── training/
│   ├── train.py                      # YOLOv8 fine-tuning script with augmentations
│   └── runs/                         # Model checkpoints and tensorboard logs
├── validation/
│   └── validate.py                   # Benchmark validation calculating mAP50 / mAP50-95
├── evaluation/
│   ├── evaluate.py                   # Confusion matrix & F1-score evaluation generator
│   └── metrics/                      # Exported confusion matrix PNG and JSON report
├── inference/
│   └── infer.py                      # Standalone CLI inference tool
└── models/
    └── waste_yolov8_best.pt          # Exported fine-tuned weights
```

---

## 3. Dataset Acquisition & Setup

You can train the model using public academic datasets:
* **TrashNet**: ~2,500 images across Glass, Paper, Cardboard, Plastic, Metal, Trash.
* **TACO (Trash Annotations in Context)**: Over 1,500 real-world outdoor trash images with segmentation & bounding boxes.
* **Waste Classification Dataset (Kaggle)**: Organic vs Recyclable imagery.

### Preprocessing Custom Datasets
To format any custom dataset into standard YOLO format:
```bash
python ml/dataset/prepare_sample_dataset.py --samples 25 --output ./ml/dataset/data
```

---

## 4. Model Training Workflow

Run the fine-tuning script with transfer learning on top of YOLOv8:
```bash
python ml/training/train.py --epochs 15 --batch 8 --imgsz 640
```
This will:
1. Load `yolov8n.pt` pretrained weights as the feature extractor.
2. Freeze backbone layers initially and apply data augmentations (Mosaic, HSV jitter, random flips).
3. Fine-tune on the 9 waste classes.
4. Automatically copy the highest validation checkpoint to `ml/models/waste_yolov8_best.pt`.

---

## 5. Model Validation & Evaluation

To benchmark validation metrics (mAP, Precision, Recall):
```bash
python ml/validation/validate.py
```

To generate the confusion matrix and per-class F1-score plots:
```bash
python ml/evaluation/evaluate.py
```
Generated artifacts:
* `ml/evaluation/metrics/confusion_matrix.png`
* `ml/evaluation/metrics/f1_score_breakdown.png`
* `ml/evaluation/metrics/evaluation_report.json`

---

## 6. CLI Testing

To test prediction directly from the terminal without starting the web server:
```bash
python ml/inference/infer.py --source path/to/sample_image.jpg --conf 0.45
```
Annotated detections will be saved to `ml/inference/runs/`.
