import os
import time
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
# Handle both direct run and import cases
try:
    from .inference import model
except ImportError:
    from inference import model
import io
from PIL import Image
import base64
import numpy as np

@app.get("/api/status")
async def get_status():
    return {"status": "running", "model": "YOLO11x", "input_shape": model.img_size}

@app.post("/api/detect")
async def detect_objects(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    
    # Record inference time
    start_time = time.time()
    boxes, scores, class_ids = model.infer(image)
    end_time = time.time()
    inference_time_ms = (end_time - start_time) * 1000  # Convert to milliseconds
    
    # Calculate metrics with detailed steps
    count = len(boxes)
    
    # Yield calculation parameters
    # 假设照片拍摄面积约为 0.6 平方米
    # 1亩 = 666.67 平方米
    # 标准小麦产量约 400 kg/亩, 标准密度约 40-50 万穗/亩
    photo_area = 0.6  # 照片面积 (平方米)
    mu_area = 666.67   # 1亩面积 (平方米)
    area_scale = mu_area / photo_area  # 面积换算系数
    avg_grain_weight = 35.0  # 单穗平均粒重 (g) - 约35-40粒 x 每粒1g
    estimated_density = count * area_scale  # 每亩估计穗数
    estimated_yield = (estimated_density * avg_grain_weight) / 1000  # kg/亩
    
    # Health index calculation (simulated based on detection confidence)
    avg_confidence = float(np.mean(scores)) if len(scores) > 0 else 0.0
    texture_score = 0.95  # 模拟纹理均匀度
    health_index = (avg_confidence * 0.6 + texture_score * 0.4) * 100
    
    results = []
    for box, score, cls in zip(boxes, scores, class_ids):
        results.append({
            "box": box.tolist(),
            "score": float(score),
            "class_id": int(cls),
            "label": "Wheat"
        })
        
    return {
        "filename": file.filename,
        "count": count,
        "estimated_yield": round(estimated_yield, 1),
        "health_index": round(health_index, 1),
        "inference_time": round(inference_time_ms, 1),
        "calculation_steps": {
            "yield": {
                "count": count,
                "photo_area": photo_area,
                "area_scale": round(area_scale, 1),
                "estimated_density": int(estimated_density),
                "avg_grain_weight": avg_grain_weight,
                "formula": "(count × 面积系数) × 单穗粒重 / 1000",
                "result": round(estimated_yield, 1)
            },
            "health": {
                "avg_confidence": round(avg_confidence * 100, 1),
                "texture_score": round(texture_score * 100, 1),
                "formula": "置信度×0.6 + 纹理×0.4",
                "result": round(health_index, 1)
            }
        },
        "detections": results
    }


# Serve Frontend (Production)
import sys

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    # Get the project root directory (parent of backend)
    current_dir = os.path.abspath(".")
    if os.path.basename(current_dir) == "backend":
        # If running from backend directory, use parent directory
        project_root = os.path.dirname(current_dir)
    else:
        # Otherwise use current directory as project root
        project_root = current_dir
    return os.path.join(project_root, relative_path)

# Serve Frontend (Production)
dist_path = get_resource_path("frontend/dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
