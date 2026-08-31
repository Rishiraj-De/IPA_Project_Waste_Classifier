# REST API Reference Manual

The backend exposes a clean, self-documenting REST API with interactive Swagger docs accessible at `http://localhost:8000/docs` and Redoc at `http://localhost:8000/redoc`.

Base URL prefix: `/api/v1`

---

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/predict/image` | Upload an image file for waste detection and disposal recommendation |
| `POST` | `/api/v1/predict/frame` | Send base64 camera frame for real-time inference |
| `GET` | `/api/v1/history` | Retrieve paginated, filtered classification history |
| `GET` | `/api/v1/history/{id}` | Get detail of a specific classification record |
| `DELETE` | `/api/v1/history/{id}` | Delete a scan record and remove stored images from disk |
| `GET` | `/api/v1/statistics` | Retrieve aggregated dashboard KPIs, category distributions, and trends |
| `GET` | `/api/v1/categories` | Retrieve all 9 supported waste categories and metadata |
| `GET` | `/api/v1/disposal-rules` | Retrieve active disposal recommendation rules |
| `GET` | `/api/v1/health` | System health check (DB, model mode, storage) |

---

## Endpoint Details

### 1. `POST /api/v1/predict/image`
Ingests an image file and executes computer vision object detection and disposal recommendation mapping.

**Content-Type**: `multipart/form-data`

**Parameters**:
* `file`: Binary image file (required; `.jpg`, `.jpeg`, `.png`, `.webp`, max 15MB)
* `enhance_contrast`: boolean (optional, default `false`)
* `confidence_threshold`: float (optional, e.g. `0.50`)

**Example `curl` Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/predict/image" \
  -F "file=@sample_bottle.jpg" \
  -F "confidence_threshold=0.45"
```

**Response Payload (`200 OK`)**:
```json
{
  "record_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-08-29T17:05:00.000Z",
  "total_objects": 1,
  "primary_category": "Plastic",
  "average_confidence": 0.94,
  "inference_time_ms": 32.5,
  "model_mode": "pretrained_mapped",
  "is_low_confidence": false,
  "warning_message": null,
  "annotated_image_url": "/uploads/annotated/9b1deb4d_annot.jpg",
  "original_image_url": "/uploads/original/9b1deb4d_orig.jpg",
  "objects": [
    {
      "object_id": 1,
      "label": "Plastic Bottle",
      "category": "Plastic",
      "confidence": 0.94,
      "bounding_box": {
        "x1": 0.25,
        "y1": 0.15,
        "x2": 0.65,
        "y2": 0.85
      },
      "disposal_info": {
        "recyclable": true,
        "recyclability_type": "Recyclable",
        "recommended_bin": "Plastic Recycling Bin",
        "bin_color_hex": "#2563EB",
        "bin_badge": "Blue Bin",
        "disposal_method": "Rinse, crush, and recycle with PET plastics.",
        "handling_instructions": [
          "Rinse bottle to eliminate sugar or milk residue.",
          "Re-attach the plastic cap so it gets recycled together.",
          "Crush body to reduce bin bulk.",
          "Deposit in Blue Recycling Bin."
        ],
        "hazard_level": "None",
        "eco_tip": "PET bottles can be spun into recycled polyester fleece jackets and carpets."
      },
      "explanation": "The model identified visual features (94% confidence) such as semi-rigid cylindrical boundaries, specular surface reflections, and translucent material characteristics typical of plastic containers."
    }
  ]
}
```

---

### 2. `POST /api/v1/predict/frame`
Optimized for real-time live webcam streaming.

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "confidence_threshold": 0.45,
  "save_record": false
}
```

---

### 3. `GET /api/v1/history`
Query classification records with filtering, searching, and pagination.

**Query Parameters**:
* `page`: integer (default `1`)
* `limit`: integer (default `10`)
* `category`: string (optional, e.g. `Plastic`, `Organic`, etc.)
* `search`: string (optional search term)
* `recyclable_only`: boolean (optional)
* `sort_by`: string (default `created_at`)
* `sort_order`: string (`desc` or `asc`)

---

### 4. `GET /api/v1/statistics`
Returns aggregated dashboard metrics, category distributions, and daily trends.

---

### 5. `GET /api/v1/health`
Returns system status, active ML weights, and database health.
```json
{
  "status": "healthy",
  "service": "AI Smart Waste Classifier & Segregation API",
  "version": "1.0.0",
  "uptime_seconds": 124.5,
  "database": {
    "status": "connected",
    "dialect": "sqlite"
  },
  "model": {
    "mode": "pretrained_mapped",
    "name": "yolov8n.pt",
    "confidence_threshold": 0.45,
    "custom_weights_present": false
  },
  "storage": {
    "upload_dir": "./uploads",
    "writable": true
  }
}
```
