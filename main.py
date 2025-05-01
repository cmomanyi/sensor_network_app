from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from sensor import Sensor
from gateway_lxfta import process_sensor_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sensors
sensor_plant = Sensor("sensor_plant_01", "plant", b'secret_aes_key_plant')
sensor_soil = Sensor("sensor_soil_01", "soil", b'secret_aes_key_soil')

@app.get("/sensor/{sensor_type}")
def get_sensor_data(sensor_type: str):
    if sensor_type == "plant":
        data = sensor_plant.generate_data()
    elif sensor_type == "soil":
        data = sensor_soil.generate_data()
    else:
        return {"error": "Invalid sensor type"}

    process_sensor_data(data)
    return {"status": "Data processed"}
