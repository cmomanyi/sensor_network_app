
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow frontend from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Soil Sensor Models & Endpoint ---
class SoilData(BaseModel):
    sensor_id: str
    temperature: float
    moisture: float
    ph: float
    nutrient_level: float
    battery_level: float
    status: str

soil_status_options = ["active", "sleeping", "compromised"]

@app.get("/api/soil")
def get_soil_data():
    sensors =[]
    for i in range(5):
        sensors.append(SoilData(
        sensor_id=f"soil-{1000 + i}",
        temperature=round(random.uniform(15.0, 35.0), 2),
        moisture=round(random.uniform(20.0, 80.0), 2),
        ph=round(random.uniform(5.5, 7.5), 2),
        nutrient_level=round(random.uniform(1.0, 5.0), 2),
        battery_level=round(random.uniform(10.0, 100.0), 2),
        status=random.choice(soil_status_options)
    ))
    return sensors

# --- Atmospheric Sensor Models & Endpoint ---
class AtmosphericData(BaseModel):
    sensor_id: str
    air_temperature: float
    humidity: float
    co2: float
    wind_speed: float
    rainfall: float
    battery_level: float
    status: str

atmospheric_status_options = ["active", "sleeping", "compromised"]

@app.get("/api/atmosphere")
def get_atmospheric_data():
    sensor_data =[]
    for i in range(5):
        sensor_data.append(AtmosphericData(
        sensor_id=f"atmo-{1000 + i}",
        air_temperature=round(random.uniform(10.0, 40.0), 2),
        humidity=round(random.uniform(30.0, 90.0), 2),
        co2=round(random.uniform(300.0, 600.0), 2),
        wind_speed=round(random.uniform(0.0, 20.0), 2),
        rainfall=round(random.uniform(0.0, 50.0), 2),
        battery_level=round(random.uniform(10.0, 100.0), 2),
        status=random.choice(atmospheric_status_options)
    ))

    return sensor_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
