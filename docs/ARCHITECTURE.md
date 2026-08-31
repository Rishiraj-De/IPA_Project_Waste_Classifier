# System Architecture & Technical Design

## 1. Overview
The **AI Smart Waste Classification and Segregation System** is designed with a decoupled, high-cohesion, low-coupling architecture. It bridges computer vision models (Ultralytics YOLOv8), an asynchronous Python web backend (FastAPI), a relational persistence layer (SQLAlchemy + SQLite/PostgreSQL), and a reactive, interactive frontend (React + TypeScript + Vite + Tailwind CSS).

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|                                                                                       |
|  [ React 18 + Vite Web Application ]                                                  |
|  ├── Landing Page (Overview & Bin Guide)                                              |
|  ├── Waste Scanner (Upload Mode & Real-time Camera HUD)                               |
|  ├── Analytics Dashboard (KPIs, Recharts Distributions, Trend Graphs)                 |
|  ├── Audit History (Search, Filters, Pagination, CSV Export, Modal Inspector)         |
|  └── Model Info (Architecture, Benchmarks, Training Guide)                            |
+------------------------------------------+--------------------------------------------+
                                           | HTTP REST (JSON / Multipart FormData)
                                           v
+---------------------------------------------------------------------------------------+
|                                    BACKEND API LAYER                                  |
|                                                                                       |
|  [ FastAPI Core Application ]                                                         |
|  ├── CORS Middleware & Security Validation                                            |
|  ├── Static File Hosting (/uploads/original, /uploads/annotated)                      |
|  └── API Router (/api/v1)                                                             |
|      ├── /predict/image  (Multipart image upload + full inference + DB save)         |
|      ├── /predict/frame  (Base64 webcam snapshot + low-latency inference)             |
|      ├── /history        (Paginated & filtered query of historical scans)             |
|      ├── /statistics     (Aggregated metrics & time-series trend computation)          |
|      ├── /categories     (Supported categories & metadata)                            |
|      ├── /disposal-rules (Active disposal rules dictionary)                           |
|      └── /health         (Model mode, DB connectivity, storage status)                |
+---------------------+---------------------------------------+-------------------------+
                      |                                       |
                      v                                       v
+-----------------------------------+   +-----------------------------------------------+
|     DISPOSAL RULE ENGINE          |   |            COMPUTER VISION SERVICE            |
|                                   |   |                                               |
| - Standard Category Scheme        |   | [ WasteInferenceEngine ]                      |
| - Item-Specific Overrides         |   | ├── Weights Loader (Fine-tuned vs Pretrained) |
| - Recyclability Evaluator         |   | ├── Pretrained COCO Semantic Mapper           |
| - Municipal Bin Color Resolver    |   | ├── Image Normalization & Enhancement (CLAHE) |
| - Step-by-Step Handling Steps     |   | ├── Visual Bounding Box Generator (PIL/CV2)   |
| - Hazard & Ecological Advisory    |   | ├── Confidence Thresholding & Uncertain Alert |
+---------------------+-------------+   | └── Model Explainability Reasoning Generator  |
                      |                 +---------------------+-------------------------+
                      +-------------------+                   |
                                          v                   v
+---------------------------------------------------------------------------------------+
|                                   PERSISTENCE LAYER                                   |
|                                                                                       |
|  [ SQLAlchemy ORM Engine ]                                                            |
|  ├── ClassificationRecord (UUID, timestamp, image paths, avg conf, model mode, etc.)  |
|  └── DetectedObjectRecord (Record FK, class name, category, bbox coords, recyc, bin)  |
|  Supported Dialects: SQLite (Local) / PostgreSQL (Cloud Production)                   |
+---------------------------------------------------------------------------------------+
```

---

## 3. Data Flow Sequences

### 3.1 Image Upload Inference Flow
1. User drops an image (JPG/PNG/WEBP) into the frontend `ImageUploader`.
2. Frontend sends multipart `POST /api/v1/predict/image`.
3. Backend validates MIME type, file extension, magic headers, and file size (≤ 15MB).
4. `ImageProcessorService` corrects EXIF orientation, standardizes to RGB, and executes optional contrast enhancement.
5. `WasteInferenceEngine` runs YOLOv8 detection.
6. Detected boxes are filtered against `CONFIDENCE_THRESHOLD`.
7. `DisposalRulesService` determines target bin, color code, prep steps, and hazard alerts for each object.
8. Annotated image with visual colored bounding boxes and confidence badges is saved to `uploads/annotated/`.
9. Records are saved into the SQLite/PostgreSQL database within a single atomic transaction.
10. Frontend renders the interactive SVG HUD overlay, metrics card, and disposal cards.

### 3.2 Real-time Webcam Ingestion Flow
1. Browser requests camera permissions via `navigator.mediaDevices.getUserMedia`.
2. High-performance canvas captures frames every 600ms.
3. Canvas frame is encoded to Base64 and transmitted via `POST /api/v1/predict/frame`.
4. Inference engine processes frame and returns bounding boxes + bin suggestions in < 80ms.
5. Real-time overlay canvas draws bounding box HUD over live video stream without freezing the browser thread.
6. User can click "Capture & Save" to store snapshot and create database audit records.

---

## 4. Database Schema Design

### ClassificationRecord Table
| Column Name | Type | Description |
|---|---|---|
| `id` | String(36) [PK] | UUID Primary Key |
| `created_at` | DateTime | Timestamp of scan (UTC) |
| `original_image_filename` | String(255) | Stored original image file name |
| `annotated_image_filename` | String(255) | Stored annotated image file name |
| `total_objects` | Integer | Count of detected items in frame |
| `primary_category` | String(64) | Dominant waste category |
| `average_confidence` | Float | Mean confidence of detected items |
| `inference_time_ms` | Float | Execution latency in milliseconds |
| `model_mode` | String(64) | `custom_fine_tuned` or `pretrained_mapped` |
| `is_low_confidence` | Boolean | Flag if confidence was under threshold |
| `source` | String(32) | `upload` or `camera` |

### DetectedObjectRecord Table
| Column Name | Type | Description |
|---|---|---|
| `id` | Integer [PK] | Auto-incrementing primary key |
| `record_id` | String(36) [FK] | Foreign key referencing `ClassificationRecord.id` |
| `object_name` | String(128) | Name of detected object (e.g. "Plastic Bottle") |
| `category` | String(64) | Standard category ("Plastic", "Metal", etc.) |
| `confidence` | Float | Confidence score [0.0 - 1.0] |
| `bbox_x1`, `bbox_y1` | Float | Top-left bounding box normalized coordinate |
| `bbox_x2`, `bbox_y2` | Float | Bottom-right bounding box normalized coordinate |
| `recyclable` | Boolean | True if recyclable, False otherwise |
| `recommended_bin` | String(128) | Municipal disposal bin |
| `disposal_method` | String(255) | Actionable disposal instruction |
| `explanation` | Text | Model visual explainability statement |
