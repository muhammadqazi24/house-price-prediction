from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Pakistan House Price Prediction API",
    description="Predicts property prices using a XGBoost model trained on Pakistan housing data.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Artifacts ─────────────────────────────────────────────────────────────
try:
    model = joblib.load("xgb.pkl")
    feature_columns = joblib.load("features.pkl")
except FileNotFoundError as e:
    raise RuntimeError(f"Model file not found: {e}")

# ── Input Schema ───────────────────────────────────────────────────────────────
class HouseInput(BaseModel):
    area: float        = Field(..., gt=0, description="Total area in sq ft")
    bedrooms: int      = Field(..., ge=1, description="Number of bedrooms")
    baths: int         = Field(..., ge=1, description="Number of bathrooms")
    location: str      = Field(..., description="Locality name e.g. DHA Defence")
    city: str          = Field(..., description="City e.g. Lahore")
    property_type: str = Field(..., description="House or Flat")
    latitude: float    = Field(..., description="Latitude coordinate")
    longitude: float   = Field(..., description="Longitude coordinate")
    province_name: str = Field(..., description="Province e.g. Punjab")

    class Config:
        json_schema_extra = {
            "example": {
                "area": 2178,
                "bedrooms": 3,
                "baths": 2,
                "location": "DHA Defence",
                "city": "Lahore",
                "property_type": "House",
                "latitude": 31.4816,
                "longitude": 74.3985,
                "province_name": "Punjab"
            }
        }

# ── Helper ─────────────────────────────────────────────────────────────────────
def build_input_df(data: HouseInput) -> pd.DataFrame:
    """
    Replicates the exact preprocessing from analysis.ipynb:
    - Engineered features: log_area = log1p(Total_Area), room_ratio = bedrooms / (baths + 1)
    - get_dummies(drop_first=True) on categorical columns
    - Aligns to saved feature_columns from training
    """

    # Raw input as a single-row DataFrame (mirrors df before feature engineering + get_dummies)
    raw = pd.DataFrame([{
        "Total_Area":    data.area,
        "bedrooms":      data.bedrooms,
        "baths":         data.baths,
        "latitude":      data.latitude,
        "longitude":     data.longitude,
        "location":      data.location,
        "city":          data.city,
        "property_type": data.property_type,
        "province_name": data.province_name,
    }])

    # ── Engineered features (must match analysis.ipynb exactly) ───────────────
    raw["log_area"]   = np.log1p(raw["Total_Area"])            # log1p(Total_Area)
    raw["room_ratio"] = raw["bedrooms"] / (raw["baths"] + 1)   # bedrooms / (baths + 1)

    # ── Apply same get_dummies(drop_first=True) as training ───────────────────
    raw_encoded = pd.get_dummies(raw, drop_first=True)

    # ── Align to training feature columns (fills missing OHE cols with 0) ─────
    raw_encoded = raw_encoded.reindex(columns=feature_columns, fill_value=0)

    return raw_encoded

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {
        "message": "Pakistan House Price Prediction API",
        "model":   "XGBoost Regressor",
        "version": "1.0.0",
        "docs":    "/docs"
    }


@app.post("/predict")
def predict(data: HouseInput):
    try:
        input_df = build_input_df(data)

        # Model was trained on np.log1p(price), so reverse with np.expm1()
        log_price = model.predict(input_df)[0]
        predicted_price = np.expm1(log_price)

        if predicted_price <= 0:
            raise ValueError("Model returned an invalid price.")

        return {
            "predicted_price":         round(float(predicted_price), 2),
            "predicted_price_million": round(float(predicted_price) / 1_000_000, 3),
            "currency": "PKR",
            "input_received": {
                "area":          data.area,
                "bedrooms":      data.bedrooms,
                "baths":         data.baths,
                "location":      data.location,
                "city":          data.city,
                "property_type": data.property_type,
                "province_name": data.province_name,
            }
        }

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}