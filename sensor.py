from utils import generate_token, verify_token
import random

class Sensor:
    def __init__(self, env, sensor_id, gateway, interval=15):
        self.env = env
        self.sensor_id = sensor_id
        self.gateway = gateway
        self.interval = interval
        self.action = env.process(self.run())

    def run(self):
        while True:
            yield self.env.timeout(self.interval)
            timestamp = int(self.env.now)
            data = {
                "sensor_id": self.sensor_id,
                "temperature": round(random.uniform(15, 35), 2),
                "moisture": round(random.uniform(20, 80), 2),
                "ph": round(random.uniform(5.5, 7.5), 2),
                "timestamp": timestamp,
                "token": generate_token(self.sensor_id, timestamp)
            }
            self.gateway.receive_data(data)

import httpx
from utils import verify_token

class Gateway:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.logs = []

    def receive_data(self, data):
        valid = verify_token(data["sensor_id"], data["timestamp"], data["token"])
        status = "VALID" if valid else "INVALID"
        print(f"[Gateway @ t={data['timestamp']}s] Data from {data['sensor_id']} - {status}")

        if valid:
            self.logs.append(data)
            self.send_to_backend(data)

    def send_to_backend(self, data):
        endpoint = "/api/soil" if "soil" in data["sensor_id"] else "/api/atmosphere"
        try:
            response = httpx.post(f"{self.base_url}{endpoint}", json=data)
            print(f"  ↳ Sent to {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"  ↳ Error sending to backend: {e}")
