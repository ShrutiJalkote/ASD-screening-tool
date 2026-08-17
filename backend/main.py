"""
FastAPI backend for the ASD screening tool.
Run: uvicorn backend.main:app --reload --port 8000
"""
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

app = FastAPI(title="ASD Screening API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend URL before deploying
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
question_cols = None
categorical_cols = None
best_model_name = None


@app.on_event("startup")
def load_artifacts():
    global model, question_cols, categorical_cols, best_model_name
    model = joblib.load(MODELS_DIR / "best_model.pkl")
    question_cols = joblib.load(MODELS_DIR / "question_cols.pkl")
    categorical_cols = joblib.load(MODELS_DIR / "categorical_cols.pkl")
    best_model_name = (MODELS_DIR / "best_model_name.txt").read_text().strip()


class ScreeningInput(BaseModel):
    # AQ-10 style questions, each 0 or 1
    A1_Score: int = Field(..., ge=0, le=1)
    A2_Score: int = Field(..., ge=0, le=1)
    A3_Score: int = Field(..., ge=0, le=1)
    A4_Score: int = Field(..., ge=0, le=1)
    A5_Score: int = Field(..., ge=0, le=1)
    A6_Score: int = Field(..., ge=0, le=1)
    A7_Score: int = Field(..., ge=0, le=1)
    A8_Score: int = Field(..., ge=0, le=1)
    A9_Score: int = Field(..., ge=0, le=1)
    A10_Score: int = Field(..., ge=0, le=1)
    age: int = Field(..., ge=1, le=120)
    gender: str
    ethnicity: Optional[str] = "Others"
    jaundice: str  # "yes" / "no"
    austim: str    # "yes" / "no"  (family history)
    relation: Optional[str] = "Self"


class ScreeningResult(BaseModel):
    prediction: str  # "ASD Traits Detected" / "No ASD Traits Detected"
    probability: float
    model_used: str
    disclaimer: str


@app.get("/")
def root():
    return {"status": "ok", "model_in_use": best_model_name}


@app.get("/model-info")
def model_info():
    import json
    comparison = json.loads((MODELS_DIR / "model_comparison.json").read_text())
    return {"best_model": best_model_name, "comparison": comparison}


@app.post("/predict", response_model=ScreeningResult)
def predict(payload: ScreeningInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    row = payload.dict()
    df = pd.DataFrame([row])

    try:
        proba = model.predict_proba(df)[0][1]
        pred = int(proba >= 0.5)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")

    return ScreeningResult(
        prediction="ASD Traits Detected" if pred == 1 else "No ASD Traits Detected",
        probability=round(float(proba), 4),
        model_used=best_model_name,
        disclaimer=(
            "This is a screening tool, not a diagnosis. Results should be "
            "discussed with a qualified healthcare professional."
        ),
    )
