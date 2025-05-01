import random, json
from crypto_utils import ecc_sign, aes_encrypt
from datetime import datetime
import uuid

def generate_sensor_data(sensor_type):
    if sensor_type == "plant":
        return {
            "chlorophyll_index": random.uniform(20, 40),
            "ndvi": random.uniform(0.3, 0.9),
            "leaf_temp": random.uniform(20, 35),
            "stress_index": random.uniform(0, 1)
        }
    elif sensor_type == "atmospheric":
        return {
            "air_temp": random.uniform(10, 40),
            "humidity": random.uniform(30, 80),
            "co2": random.uniform(300, 600),
            "wind_speed": random.uniform(0, 15)
        }
    elif sensor_type == "soil":
        return {
            "moisture": random.uniform(10, 50),
            "pH": random.uniform(5.5, 7.5),
            "EC": random.uniform(0.2, 2.5),
            "soil_temp": random.uniform(15, 30)
        }
    elif sensor_type == "threat":
        return {
            "motion": random.choice([True, False]),
            "vibration": random.uniform(0, 5),
            "light_disruption": random.choice([True, False]),
            "intrusion": random.choice([True, False])
        }
def simulate_sensor_data(sensor_id, private_key, aes_key):
    data = {
        "sensor_id": sensor_id,
        "timestamp": datetime.utcnow().isoformat(),
        "nonce": str(uuid.uuid4()),
        "data": {...}  # simulated sensor values
    }
    raw_data = json.dumps(data).encode()
    signature = ecc_sign(private_key, raw_data)
    nonce, encrypted = aes_encrypt(raw_data, aes_key)
    return {
        "encrypted_data": encrypted,
        "aes_nonce": nonce,
        "signature": signature,
        "sensor_id": sensor_id
    }

def simulate_sensor(sensor_type, aes_key):
    data = generate_sensor_data(sensor_type)
    payload = json.dumps(data)
    encrypted = aes_encrypt(aes_key, payload)
    return {
        "sensor_id": str(uuid.uuid4()),
        "type": sensor_type,
        "payload": encrypted
    }
