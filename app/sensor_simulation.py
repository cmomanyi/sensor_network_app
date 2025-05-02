import simpy
import networkx as nx
import random
import json
from datetime import datetime
from app.crypto_utils import CryptoUtils

latest_sensor_data = {}

SENSOR_TYPES = {
    "soil": ["moisture", "temperature", "pH", "nitrogen", "phosphorus"],
    "atmospheric": ["air_temp", "humidity", "co2", "wind_speed", "rainfall"],
    "plant": ["leaf_moisture", "chlorophyll", "growth_rate", "disease_risk", "stem_diameter"],
    "threat": ["unauthorized_access", "jamming", "tampering", "spoofing", "anomaly_score"],
    "water": ["flow_rate", "water_level", "salinity", "ph", "turbidity"]
}


class SensorNode:
    def __init__(self, env, sensor_id, sensor_type, key, gateway, network):
        self.env = env
        self.sensor_id = sensor_id
        self.sensor_type = sensor_type
        self.key = key
        self.gateway = gateway
        self.network = network
        self.process = env.process(self.run())

    def generate_data(self):
        readings = {}
        for field in SENSOR_TYPES[self.sensor_type]:
            if "moisture" in field:
                readings[field] = round(random.uniform(10, 80), 2)
            elif "temp" in field:
                readings[field] = round(random.uniform(10, 35), 1)
            elif field in {"pH", "ph"}:
                readings[field] = round(random.uniform(5.5, 8.5), 2)
            elif "co2" in field:
                readings[field] = round(random.uniform(300, 700), 1)
            elif "wind_speed" in field:
                readings[field] = round(random.uniform(0, 15), 1)
            elif "rainfall" in field:
                readings[field] = round(random.uniform(0, 50), 1)
            elif "chlorophyll" in field:
                readings[field] = round(random.uniform(20, 60), 2)
            elif "disease_risk" in field or "anomaly_score" in field:
                readings[field] = round(random.uniform(0, 1), 2)
            elif "tampering" in field or "spoofing" in field or "unauthorized_access" in field:
                readings[field] = random.choice([0, 1])
            else:
                readings[field] = round(random.uniform(1, 100), 2)

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "sensor_id": self.sensor_id,
            "type": self.sensor_type,
            "data": readings
        }

    def run(self):
        while True:
            yield self.env.timeout(random.randint(5, 10))
            data = self.generate_data()
            json_data = json.dumps(data)
            nonce, encrypted = CryptoUtils.encrypt_data(json_data, self.key)
            path = nx.shortest_path(self.network, self.sensor_id, self.gateway.gateway_id)
            print(f"[{self.env.now}] {self.sensor_id} sending data via path: {path}")
            self.gateway.receive(self.sensor_id, nonce, encrypted, data['timestamp'])


class Gateway:
    def __init__(self, gateway_id):
        self.gateway_id = gateway_id
        self.key = b"0" * 16

    def receive(self, sensor_id, nonce, encrypted, timestamp):
        if not CryptoUtils.is_sensor_authorized(sensor_id):
            print(f"Unauthorized sensor: {sensor_id}")
            return
        if not CryptoUtils.is_valid_request(datetime.fromisoformat(timestamp), nonce):
            print(f"Replay attack detected from: {sensor_id}")
            return
        try:
            data = CryptoUtils.decrypt_data(nonce, encrypted, self.key)
            print(f"✅ {sensor_id} @ {timestamp} — Data received: {data}")
            sensor_payload = json.loads(data)
            sensor_type = sensor_payload["sensor_id"].split("_")[0]
            latest_sensor_data[sensor_id] = {
                "sensor_id": sensor_id,
                "timestamp": timestamp,
                "type": sensor_type,
                "data": sensor_payload["data"]  # extract actual readings
            }

            # latest_sensor_data[sensor_id] = {"timestamp": timestamp, "data": json.loads(data)}
        except Exception as e:
            print(f"❌ Decryption failed from {sensor_id}: {e}")


def save_sensor_data_to_file(cycle):
    filename = f"sensor_data_cycle_{cycle}.json"
    with open(filename, "w") as f:
        json.dump(latest_sensor_data, f, indent=2)
    print(f"📁 Saved sensor data to {filename}")


def periodic_data_saver(env, interval):
    cycle = 1
    while True:
        yield env.timeout(interval)
        save_sensor_data_to_file(cycle)
        latest_sensor_data.clear()
        print(f"♻️ Data reset after {interval} units (Cycle {cycle})\n")
        cycle += 1


def run_simulation(simulation_duration=900, save_interval=300):
    env = simpy.Environment()
    gateway = Gateway("gateway_1")
    G = nx.Graph()
    G.add_node("gateway_1")

    all_sensor_ids = []

    for sensor_type in SENSOR_TYPES:
        for i in range(1, 6):  # 5 sensors per type
            sensor_id = f"{sensor_type}_{i:02}"
            all_sensor_ids.append((sensor_id, sensor_type))
            G.add_node(sensor_id)
            G.add_edge(sensor_id, "gateway_1")

    for sid, stype in all_sensor_ids:
        SensorNode(env, sid, stype, gateway.key, gateway, G)

    # Start periodic data saving process
    env.process(periodic_data_saver(env, save_interval))

    print("🚀 Starting continuous simulation with periodic saves...\n")
    env.run(until=simulation_duration)


if __name__ == "__main__":
    run_simulation(cycles=3)  # Adjust cycles as needed
