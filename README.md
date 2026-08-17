# 🧠 Autism Spectrum Disorder Detection

An end-to-end Machine Learning application for **Autism Spectrum Disorder (ASD) screening** using AQ-10 behavioral questionnaire responses and demographic information.

The system compares multiple Machine Learning algorithms and serves the best-performing model through a **FastAPI backend** with a modern **React frontend**.

> ⚠️ **Disclaimer:** This project is intended for educational and screening purposes only. It is not a medical diagnostic tool and should not replace professional medical advice.

## 🚀 Project Overview

The application takes **AQ-10 behavioral questionnaire responses** along with demographic information and predicts whether the input indicates a higher likelihood of ASD.

Four Machine Learning models were trained and evaluated:

- Logistic Regression
- Support Vector Machine (SVM)
- Random Forest
- K-Nearest Neighbors (KNN)

The models were evaluated using **5-fold cross-validation**, and the best-performing model was selected for deployment.

### 🏆 Best Result

**Logistic Regression achieved 99.5% cross-validated accuracy.**

| Model | CV Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| **Logistic Regression** | **99.5%** | **100%** | **100%** | **100%** |
| SVM | 97.7% | 100% | 84.2% | 91.4% |
| KNN | 96.6% | 97.3% | 94.7% | 96.0% |
| Random Forest | 96.3% | 96.7% | 76.3% | 85.3% |

## ✨ Features

- 🧠 ASD screening using AQ-10 behavioral responses
- 👤 Demographic information processing
- 🤖 Comparison of four Machine Learning algorithms
- 📊 5-fold cross-validation
- ⚙️ Automated preprocessing pipeline
- 🚀 FastAPI REST API
- ⚛️ React-based frontend
- 📈 Model comparison information through API
- 🔒 Input validation using Pydantic
- ☁️ Deployment-ready backend
- ⚠️ Medical screening disclaimer included

## 🏗️ System Architecture

```text
                 ┌──────────────────────┐
                 │     React Frontend   │
                 │    Questionnaire UI  │
                 └──────────┬───────────┘
                            │
                            │ HTTP Request
                            ▼
                 ┌──────────────────────┐
                 │    FastAPI Backend   │
                 │                      │
                 │  /predict            │
                 │  /model-info         │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Preprocessing        │
                 │ Pipeline             │
                 │                      │
                 │ Imputation            │
                 │ Scaling               │
                 │ One-Hot Encoding      │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Logistic Regression  │
                 │      Model           │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Prediction +         │
                 │ Probability +        │
                 │ Disclaimer           │
                 └──────────────────────┘
```

## 🧪 Machine Learning Pipeline

The project uses a Scikit-learn preprocessing pipeline to ensure consistent preprocessing during both training and prediction.

### Numerical Features

- Age
- AQ-10 behavioral scores

Processing:

```text
Missing Values
      ↓
Median Imputation
      ↓
Standard Scaling
```

### Categorical Features

- Gender
- Ethnicity
- Jaundice history
- Family history of autism
- Relation to respondent

Processing:

```text
Missing Values
      ↓
Most-Frequent Imputation
      ↓
One-Hot Encoding
```

All preprocessing and model operations are wrapped into a single deployable pipeline to avoid inconsistencies between training and prediction.

## 🤖 Models Used

### 1. Logistic Regression

Selected as the best-performing model based on cross-validation results.

**Cross-validated accuracy: 99.5%**

### 2. Support Vector Machine

Achieved **97.7% cross-validated accuracy**.

### 3. K-Nearest Neighbors

Achieved **96.6% cross-validated accuracy**.

### 4. Random Forest

Achieved **96.3% cross-validated accuracy**.

## 📊 Why Logistic Regression Performed Best

The AQ-10 questionnaire is strongly related to the target label because the label is derived from behavioral screening responses.

The project therefore evaluates the models using **5-fold cross-validation** rather than relying only on a single train/test split.

The demographic variables also provide additional information beyond the questionnaire responses.

## 🔌 API Endpoints

### `POST /predict`

Accepts questionnaire and demographic information and returns:

- ASD prediction
- Prediction probability
- Disclaimer

### `GET /model-info`

Returns information about the trained models and their comparison metrics.

## 📁 Project Structure

```text
asd-detection/
│
├── backend/
│   ├── main.py
│   └── train_model.py
│
├── data/
│   ├── autism_screening.csv
│   └── generate_synthetic.py
│
├── models/
│   └── model_comparison.json
│
├── frontend-react/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── PulseTrace.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
└── README.md
```

## 🛠️ Tech Stack

### Machine Learning

- Python
- NumPy
- Pandas
- Scikit-learn

### Backend

- FastAPI
- Uvicorn
- Pydantic

### Frontend

- React
- Vite
- JavaScript
- CSS

### Development & Deployment

- Git
- GitHub
- Render

## 💻 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/asd-detection.git
cd asd-detection
```

### 2. Create a Virtual Environment

Windows:

```powershell
python -m venv venv
venv\Scripts\activate
```

### 3. Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Train the Models

```powershell
python backend/train_model.py
```

### 5. Start the FastAPI Backend

```powershell
uvicorn backend.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

## ⚛️ Running the React Frontend

Open another terminal:

```powershell
cd frontend-react
npm install
npm run dev
```

The frontend will be available at the URL shown by Vite, typically:

```text
http://localhost:5173
```

## ☁️ Deployment

The FastAPI backend can be deployed on Render.

### Backend Configuration

```text
Name: asd-detection-api
Runtime: Python 3

Build Command:
pip install -r requirements.txt && python backend/train_model.py

Start Command:
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

The project can be connected directly to the GitHub repository for automatic deployment.

## 🐛 Debugging & Development Notes

During development, the original dataset contained a column naming inconsistency:

```text
jundice
```

instead of:

```text
jaundice
```

The API schema used the correct spelling, so the mismatch caused prediction issues when the real dataset was integrated.

The issue was resolved by aligning the preprocessing pipeline and dataset feature names.

## 📈 Model Evaluation

The project uses **5-fold cross-validation** to obtain a more reliable estimate of model performance.

The complete comparison results are stored in:

```text
models/model_comparison.json
```

The training logic is implemented in:

```text
backend/train_model.py
```

The API implementation is located in:

```text
backend/main.py
```

The questionnaire and result interface is implemented in:

```text
frontend-react/src/App.jsx
```

## 🔮 Future Improvements

- Add additional clinically validated datasets
- Improve model interpretability using SHAP/LIME
- Add visualization of questionnaire responses
- Add authentication and user accounts
- Add prediction history
- Improve accessibility and responsive design
- Add automated model retraining
- Add comprehensive unit and integration tests
- Deploy the React frontend separately
- Add CI/CD using GitHub Actions

## ⚠️ Disclaimer

This application is an **educational Machine Learning project** designed for ASD screening research and demonstration.

It does **not** provide a medical diagnosis.

Predictions should not be used as a substitute for evaluation by a qualified healthcare professional.

## 👩‍💻 Author

**Shruti Jalkote**

B.E. Artificial Intelligence & Data Science

Pune, Maharashtra, India

## ⭐ If You Find This Project Useful

Consider giving the repository a ⭐ on GitHub!
