# Installation & Setup Guide

This guide details how to set up, configure, run, and test the **AI Smart Waste Classification and Segregation System** on Windows, Linux, macOS, and Docker environments.

---

## Prerequisites
* **Python**: Version 3.10, 3.11, 3.12, or 3.13
* **Node.js**: Version 18.x, 20.x, or 22.x
* **npm**: Version 9.x or 10.x
* **Git** (optional)

---

## 1. Local Setup Instructions

### 1.1 Backend Setup
1. Open a terminal and navigate to the project directory:
   ```bash
   cd c:/Users/KIIT/Desktop/IPA_PROJECT
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Ensure `.env` is configured (or copy from `.env.example`):
   ```bash
   copy .env.example .env
   ```

4. Start the backend development server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   * The API will be live at: `http://localhost:8000`
   * Interactive Swagger Documentation: `http://localhost:8000/docs`
   * Redoc Alternative: `http://localhost:8000/redoc`

---

### 1.2 Frontend Setup
1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   * The Web Application will be live at: `http://localhost:5173`

---

## 2. Machine Learning Tools

### 2.1 Prepare Sample Annotated Dataset
Generates 99 realistic annotated images across train/val/test splits for all 9 waste classes:
```bash
python ml/dataset/prepare_sample_dataset.py --samples 15
```

### 2.2 Fine-Tune YOLOv8 on Waste Dataset
```bash
python ml/training/train.py --epochs 15 --batch 8 --imgsz 640
```
This automatically updates `ml/models/waste_yolov8_best.pt`.

### 2.3 Benchmark Model Validation
```bash
python ml/validation/validate.py
```

### 2.4 Generate Confusion Matrix & Evaluation Plots
```bash
python ml/evaluation/evaluate.py
```
Generated artifacts are saved in `ml/evaluation/metrics/`.

### 2.5 CLI Inference Test
```bash
python ml/inference/infer.py --source ml/dataset/data/images/test/plastic_0001.jpg --conf 0.45
```

---

## 3. Running Automated Tests

To execute the complete automated test suite (19 test cases):
```bash
python -m pytest tests/ -v
```

---

## 4. Docker Deployment

To launch the complete multi-container system with Docker Compose:
```bash
docker-compose up --build
```
* Frontend: `http://localhost:80`
* Backend API: `http://localhost:8000`
