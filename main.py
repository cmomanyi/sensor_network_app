from fastapi import FastAPI, BackgroundTasks
from sensor import simulate_sensor
from gateway_lxfta import process_sensor_data, WHITELIST_IDS, log_event
from api_simulator import receive_data_from_gateway
from crypto_utils import generate_ecc_key_pair
import json

app = FastAPI()

# Setup keys and whitelist
sensor_private, sensor_public = generate_ecc_key_pair()
gateway_private, gateway_public = generate_ecc_key_pair()
shared_aes_key = b"thisisakey123456"

@app.get("/sensor/{sensor_type}")
def get_sensor_data(sensor_type: str, background_tasks: BackgroundTasks):
    sensor_data = simulate_sensor(sensor_type, shared_aes_key)
    WHITELIST_IDS.add(sensor_data["sensor_id"])
    processed = process_sensor_data(sensor_data, shared_aes_key)

    if "Decryption failed" not in processed:
        log = {
            "sensor_id": sensor_data["sensor_id"],
            "type": sensor_type,
            "data": json.loads(processed)
        }
        background_tasks.add_task(receive_data_from_gateway, log)
        return log
    else:
        return {"error": processed}

@app.get("/logs/{sensor_type}")
def get_logs(sensor_type: str):
    logs = []
    with open("gateway_logs.json", "r") as f:
        for line in f:
            record = json.loads(line)
            if record["data"].get("type", sensor_type) == sensor_type:
                logs.append(record)
    return logs
