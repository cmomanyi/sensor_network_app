import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
