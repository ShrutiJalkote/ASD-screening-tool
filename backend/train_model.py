"""
Trains and compares Logistic Regression, SVM, Random Forest, and KNN
on the ASD screening dataset. Saves the best model + preprocessing
pipeline to models/ for the FastAPI backend to load.

Run: python backend/train_model.py
"""
import json
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, classification_report,
                              confusion_matrix, f1_score, precision_score,
                              recall_score, roc_auc_score)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC

warnings.filterwarnings("ignore")

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "autism_screening.csv"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Load
# ---------------------------------------------------------------------------
df = pd.read_csv(DATA_PATH)

# ---------------------------------------------------------------------------
# 2. Drop leakage-prone / non-predictive columns
#
#    "result" is literally the sum of A1-A10 (or near-identical to it) in the
#    real dataset -> including it alongside A1-A10 is why people report
#    100% accuracy. It's not wrong data, it's a duplicated signal. We drop it
#    here and keep only the raw question responses, which is the honest
#    version of the screening-tool use case (predict from answers only).
#    age_desc is constant/near-constant in the adult dataset -> useless.
#    used_app_before and contry_of_res are not behavioral signal -> drop
#    to keep the model generalizable and avoid encoding 60+ country dummies
#    on a ~800-row dataset.
# ---------------------------------------------------------------------------
drop_cols = [c for c in ["result", "age_desc", "used_app_before", "contry_of_res"] if c in df.columns]
df = df.drop(columns=drop_cols)

target_col = "Class/ASD"
y = (df[target_col].astype(str).str.strip().str.upper() == "YES").astype(int)
X = df.drop(columns=[target_col])

question_cols = [c for c in X.columns if c.startswith("A") and c.endswith("_Score")]
numeric_cols = ["age"] + question_cols
categorical_cols = [c for c in X.columns if c not in numeric_cols]

# ---------------------------------------------------------------------------
# 3. Preprocessing pipeline
# ---------------------------------------------------------------------------
numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])
categorical_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore")),
])
preprocessor = ColumnTransformer(transformers=[
    ("num", numeric_transformer, numeric_cols),
    ("cat", categorical_transformer, categorical_cols),
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "SVM": SVC(kernel="rbf", probability=True, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=7),
}

results = []
fitted_pipelines = {}

for name, clf in models.items():
    pipe = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", clf)])
    pipe.fit(X_train, y_train)
    preds = pipe.predict(X_test)
    probs = pipe.predict_proba(X_test)[:, 1] if hasattr(pipe, "predict_proba") else None

    cv_scores = cross_val_score(pipe, X_train, y_train, cv=5, scoring="accuracy")

    metrics = {
        "model": name,
        "test_accuracy": round(accuracy_score(y_test, preds), 4),
        "precision": round(precision_score(y_test, preds), 4),
        "recall": round(recall_score(y_test, preds), 4),
        "f1": round(f1_score(y_test, preds), 4),
        "roc_auc": round(roc_auc_score(y_test, probs), 4) if probs is not None else None,
        "cv_mean_accuracy": round(cv_scores.mean(), 4),
        "cv_std": round(cv_scores.std(), 4),
    }
    results.append(metrics)
    fitted_pipelines[name] = pipe
    print(f"\n=== {name} ===")
    print(json.dumps(metrics, indent=2))
    print(confusion_matrix(y_test, preds))

# ---------------------------------------------------------------------------
# 4. Pick best model by cross-validated accuracy (more honest than a single
#    test-set number on a small dataset)
# ---------------------------------------------------------------------------
results_df = pd.DataFrame(results).sort_values("cv_mean_accuracy", ascending=False)
print("\n\n=== SUMMARY (sorted by CV accuracy) ===")
print(results_df.to_string(index=False))

best_name = results_df.iloc[0]["model"]
best_pipeline = fitted_pipelines[best_name]
print(f"\nBest model: {best_name}")

joblib.dump(best_pipeline, MODELS_DIR / "best_model.pkl")
joblib.dump(question_cols, MODELS_DIR / "question_cols.pkl")
joblib.dump(categorical_cols, MODELS_DIR / "categorical_cols.pkl")
results_df.to_json(MODELS_DIR / "model_comparison.json", orient="records", indent=2)

with open(MODELS_DIR / "best_model_name.txt", "w") as f:
    f.write(best_name)

print(f"\nSaved best model ({best_name}) and comparison results to {MODELS_DIR}/")
