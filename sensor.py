import json
import time
import uuid
from crypto_utils import generate_ecc_key_pair, sign_data, encrypt_data

class Sensor:
    def __init__(self, sensor_id, sensor_type, aes_key):
        self.sensor_id = sensor_id
        self.sensor_type = sensor_type
        self.aes_key = aes_key
        self.private_key, self.public_key = generate_ecc_key_pair()

    def generate_data(self):
        # Simulate sensor data based on type
        if self.sensor_type == "plant":
            data = {
                "chlorophyll_index": 0.8,
                "ndvi": 0.6,
                "leaf_temp": 25.5,
                "stress_index": 0.2
            }
        elif self.sensor_type == "soil":
            data = {
                "moisture": 30,
                "ph": 6.5,
                "ec": 1.2,
                "soil_temp": 22.3
            }
        elif self.sensor_type == "atmospheric":
            data = {
                "air_temp": 24.5,
                "humidity": 60,
                "co2": 400,
                "wind_speed": 5.5
            }
        elif self.sensor_type == "threat":
            data = {
                "motion_detected": True,
                "vibration_level": 0.05,
                "light_disruption": False,
                "intrusion_alert": True
            }
        else:
            data = {}

        payload = {
            "sensor_id": self.sensor_id,
            "timestamp": time.time(),
            "nonce": str(uuid.uuid4()),
            "data": data
        }

        payload_bytes = json.dumps(payload).encode()
        signature = sign_data(self.private_key, payload_bytes)
        nonce, encrypted_data = encrypt_data(self.aes_key, payload_bytes)

        return {
            "sensor_id": self.sensor_id,
            "sensor_type": self.sensor_type,
            "nonce": nonce.hex(),
            "encrypted_data": encrypted_data.hex(),
            "signature": signature.hex()
        }
