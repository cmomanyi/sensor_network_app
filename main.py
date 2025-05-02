import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

from app.auth import router as auth_router
from app.gateway import router as gateway_router
from app.sensor_simulation import latest_sensor_data, run_simulation, SENSOR_TYPES

app = FastAPI()

# CORS setup (can be adjusted for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # You can use ["*"] during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes for authentication and gateway
app.include_router(auth_router)
app.include_router(gateway_router)

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


# API endpoint to fetch sensor data for the dashboard
@app.get("/dashboard/data")
def get_dashboard_data():
    try:
        # You can format the data or add any processing here if needed
        return {"sensors": list(latest_sensor_data.values())}
    except Exception as e:
        return {"error": f"Error fetching sensor data: {str(e)}"}


# API endpoint to fetch sensor types and their corresponding sensors
@app.get("/dashboard/types")
def get_sensor_types():
    try:
        # Return the available sensor types from SENSOR_TYPES (you can enhance the response if needed)
        return {"types": SENSOR_TYPES}
    except Exception as e:
        return {"error": f"Error fetching sensor types: {str(e)}"}


# Background thread to run sensor simulation
def start_simulation():
    try:
        print("🚀 Starting sensor simulation in background...")
        run_simulation()
    except Exception as e:
        print(f"❌ Error in sensor simulation: {str(e)}")


# Start the simulation in a background thread
threading.Thread(target=start_simulation, daemon=True).start()
