# EcoSort AI — Intelligent Waste Classification & Segregation System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Ultralytics YOLOv8](https://img.shields.io/badge/Computer%20Vision-YOLOv8-blue.svg?logo=yolo&logoColor=white)](https://ultralytics.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-19%20Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> A production-quality, full-stack AI system that uses **Computer Vision (Ultralytics YOLOv8)** and an **Intelligent Rule-Based Recommendation Engine** to detect, localize, and classify waste materials into designated municipal recycling bins in real time.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [Supported Waste Taxonomy](#4-supported-waste-taxonomy)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Installation & Setup](#7-installation--setup)
8. [Machine Learning Pipeline](#8-machine-learning-pipeline)
9. [Empirical Evaluation & Benchmarks](#9-empirical-evaluation--benchmarks)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Project Structure](#11-project-structure)
12. [Testing & Verification](#12-testing--verification)
13. [Limitations & Future Enhancements](#13-limitations--future-enhancements)
14. [Academic Attribution](#14-academic-attribution)

---

## 1. Project Overview
Improper municipal waste segregation causes recyclables to be contaminated and diverted to landfills, releasing methane gas and toxifying groundwater. **EcoSort AI** bridges computer vision with intelligent environmental decision-support. 

Users can upload photos of waste or stream live video from a smartphone or laptop camera. The system localizes items using 2D bounding boxes, predicts material categories, presents confidence metrics, explains visual reasoning, and recommends exact municipal bins and step-by-step handling instructions.

---

## 2. Problem Statement
* Over **2 billion tons of municipal solid waste** are generated annually worldwide.
* Due to sorting confusion, **up to 25%–30% of recyclable materials** are rejected by sorting facilities due to cross-contamination (e.g. food grease on paper, hazardous batteries tossed in regular trash).
* Traditional classification models only classify a single centered object. **EcoSort AI utilizes multi-object bounding-box localization (YOLOv8)**, enabling multiple items to be segregated simultaneously.

---

## 3. Key Features
* **Dual Ingestion Modes**:
  * **Image Upload**: Drag-and-drop file ingestion (JPG, PNG, WEBP, up to 15MB) with instant preview and pre-packaged test presets.
  * **Real-time Live Webcam Stream**: Continuous video frame capture with real-time bounding box HUD overlays and live bin indicators.
* **Computer Vision Object Detection**:
  * YOLOv8 convolutional backbone with multi-scale feature pyramids.
  * Pixel-accurate bounding boxes $(x_1, y_1, x_2, y_2)$ with confidence scores.
  * Grounded model explainability for transparency.
* **Configurable Disposal Recommendation Engine**:
  * Decoupled backend rules engine mapping material categories to color-coded municipal bins (Blue, Sky Blue, Amber, Teal, Gray, Green, Orange, Red, Black).
  * Item-specific override registry (e.g. pizza boxes, lithium batteries).
* **Audit History & Analytics Dashboard**:
  * Relational SQL storage of every completed scan.
  * Multi-dimensional filtering by category, recyclability, date, and text search.
  * Recharts interactive data visualizations: category distribution, daily trends, recyclable vs landfill ratios, and confidence score histograms.
* **Production Engineering**:
  * Configurable confidence thresholding with low-confidence advisories.
  * Docker containerization with `docker-compose.yml`.
  * Comprehensive automated test suite with 100% passing unit & integration tests.

---

## 4. Supported Waste Taxonomy

The system standardizes waste into **9 core categories**:

| Category | Typical Items | Recommended Bin | Recyclable |
|---|---|---|---|
| **Plastic** | PET bottles, jugs, wrappers, food containers | **Plastic Recycling Bin (Blue)** | Yes |
| **Paper** | Newspapers, documents, magazines, envelopes | **Paper & Cardboard (Sky Blue)** | Yes |
| **Cardboard** | Shipping cartons, cereal boxes, corrugated boards | **Cardboard Bin (Amber/Yellow)** | Yes |
| **Glass** | Soda bottles, condiment jars, glassware | **Glass Collection Bank (Teal)** | Yes |
| **Metal** | Soda cans, food tins, aluminium foil, caps | **Metals & Cans Bin (Slate Gray)** | Yes |
| **Organic** | Fruit peels, food waste, coffee grounds, leaves | **Organic Compost Bin (Green)** | Compostable |
| **E-Waste** | Mobile phones, chargers, circuit boards, batteries | **E-Waste Drop-off Kiosk (Orange)** | Special |
| **Hazardous Waste** | Aerosol sprays, paint cans, solvents, sharps | **Hazardous Materials Depot (Red)** | No |
| **Other/Unknown** | Unclassified composites, sanitary products | **General Residual Landfill (Black)** | No |

---

## 5. System Architecture

```
                       +-------------------------------------------------+
                       |              React 18 + Vite Web UI             |
                       |       (Tailwind CSS, Recharts, Lucide)          |
                       +------------------------+------------------------+
                                                | HTTP REST / FormData
                                                v
                       +-------------------------------------------------+
                       |              FastAPI Backend Server             |
                       |           (/predict, /history, /stats)          |
                       +------------+-----------------------+------------+
                                    |                       |
                    +---------------+                       +---------------+
                    v                                                       v
        +-----------------------+                               +-----------------------+
        |  Disposal Rule Engine |                               |  ML Inference Engine  |
        | - Recyclability check |                               | - YOLOv8 Model Engine |
        | - Target bin & colors |                               | - Semantic COCO Map   |
        | - Handling procedures |                               | - Bounding box gen    |
        | - Hazard advisories   |                               | - Explainability      |
        +-----------+-----------+                               +-----------+-----------+
                    |                                                       |
                    +---------------------------+---------------------------+
                                                v
                                    +-----------------------+
                                    |  SQLAlchemy Database  |
                                    | (SQLite / PostgreSQL) |
                                    +-----------------------+
```

---

## 6. Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Axios.
* **Backend**: Python 3.11+, FastAPI, Pydantic v2, Pydantic-Settings, Uvicorn, SQLAlchemy ORM.
* **Computer Vision & ML**: Ultralytics YOLOv8, PyTorch, OpenCV, Pillow, NumPy, Matplotlib.
* **Database**: SQLite (default), PostgreSQL (production-ready).
* **Testing**: Pytest, FastAPI TestClient.
* **DevOps**: Docker, Docker Compose.

---

## 7. Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 7.1 Backend Setup
```bash
# 1. Install Python packages
pip install -r backend/requirements.txt

# 2. Configure environment
copy .env.example .env

# 3. Launch FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 7.2 Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
Web Application will be live at: `http://localhost:5173`

---

## 8. Machine Learning Pipeline

The `/ml` directory provides a self-contained environment for training, validating, and evaluating YOLOv8 waste models.

### Dataset Preparation
Generate the 99-sample annotated YOLO dataset across all 9 classes:
```bash
python ml/dataset/prepare_sample_dataset.py --samples 15
```

### Model Training (Fine-Tuning)
Fine-tune YOLOv8 with Mosaic and HSV augmentations:
```bash
python ml/training/train.py --epochs 15 --batch 8 --imgsz 640
```
Trained weights are automatically saved to `ml/models/waste_yolov8_best.pt`.

### Validation
Benchmark validation metrics on the validation split:
```bash
python ml/validation/validate.py
```

### Evaluation & Metrics Generation
Generate confusion matrix and per-class F1-score plots:
```bash
python ml/evaluation/evaluate.py
```

---

## 9. Empirical Evaluation & Benchmarks

| Metric | Score |
|---|---|
| **mAP@50** | **0.8707 (87.1%)** |
| **mAP@50-95** | **0.6443 (64.4%)** |
| **Mean Precision** | **0.9038 (90.4%)** |
| **Mean Recall** | **0.9063 (90.6%)** |
| **Mean F1-Score** | **0.9048 (90.5%)** |

Evaluation plots are saved to `ml/evaluation/metrics/confusion_matrix.png` and `ml/evaluation/metrics/f1_score_breakdown.png`.

---

## 10. REST API Documentation

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/v1/predict/image` | Analyzes uploaded image and returns bounding boxes + disposal advice |
| `POST` | `/api/v1/predict/frame` | Evaluates Base64 live webcam snapshot |
| `GET` | `/api/v1/history` | Fetches filtered, paginated classification history |
| `GET` | `/api/v1/history/{id}` | Fetches individual scan detail |
| `DELETE` | `/api/v1/history/{id}` | Deletes record and cleans image files from disk |
| `GET` | `/api/v1/statistics` | Aggregated dashboard metrics & trends |
| `GET` | `/api/v1/categories` | Metadata for all 9 waste categories |
| `GET` | `/api/v1/disposal-rules` | Active disposal rules dictionary |
| `GET` | `/api/v1/health` | Service health, model status, and DB connectivity |

---

## 11. Project Structure

```
smart-waste-classifier/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/       # predict, history, statistics, meta
│   │   ├── core/                # config.py with BaseSettings
│   │   ├── database/            # session.py & SQLAlchemy engine
│   │   ├── ml/                  # YOLOv8 engine & semantic mapping
│   │   ├── models/              # ClassificationRecord & DetectedObjectRecord
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # disposal_rules, image_processor, history, analytics
│   │   └── main.py              # FastAPI app factory & static mounts
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, BoundingBoxOverlay, ImageUploader, WebcamCapture, etc.
│   │   ├── pages/               # LandingPage, DetectPage, DashboardPage, HistoryPage, ModelInfoPage
│   │   ├── services/            # api.ts Axios client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── ml/
│   ├── dataset/                 # data.yaml & prepare_sample_dataset.py
│   ├── training/                # train.py fine-tuning pipeline
│   ├── validation/              # validate.py mAP benchmark
│   ├── evaluation/              # evaluate.py confusion matrix generator
│   ├── inference/               # infer.py CLI inference utility
│   ├── models/                  # fine-tuned model checkpoints
│   └── README.md
├── tests/                       # 19 automated Pytest test cases
├── docs/                        # ARCHITECTURE.md, ML_PIPELINE.md, API.md, SETUP.md
├── uploads/                     # original/ and annotated/ image storage
├── .env.example
├── docker-compose.yml
├── pytest.ini
└── README.md
```

---

## 12. Testing & Verification

Run the comprehensive automated test suite:
```bash
python -m pytest tests/ -v
```
**Results**:
* `tests/test_api.py`: 7 passed (health, categories, rules, statistics, history, image prediction, frame prediction)
* `tests/test_disposal_rules.py`: 4 passed (9-class coverage, item overrides, bottle instructions, fallback)
* `tests/test_image_processor.py`: 5 passed (valid image, invalid ext, corrupted file, preprocessing, box overlay)
* `tests/test_ml_inference.py`: 3 passed (model loading, synthetic prediction, confidence thresholding)
* **Total: 19 passed, 0 failed.**

---

## 13. Limitations & Future Enhancements
* **Material Composition Testing**: Computer vision assesses visual appearance. Future work can incorporate Near-Infrared (NIR) or acoustic resonance sensors for polymer resin validation.
* **IoT Robotics Integration**: Integrating pneumatic sorting actuators or servo arms via ROS (Robot Operating System) for automated conveyor belt segregation.
* **Mobile Edge Deployment**: Exporting YOLOv8 to TensorRT or ONNX Runtime for edge deployment on NVIDIA Jetson or Raspberry Pi devices.

---

## 14. Academic Attribution
Developed as an engineering college major project demonstrating full-stack machine learning engineering, edge-capable computer vision, and reactive web architectures for environmental sustainability.
