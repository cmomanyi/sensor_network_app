import json, time
from crypto_utils import aes_decrypt

WHITELIST_IDS = set()

def process_sensor_data(sensor_data, aes_key):
    if sensor_data['sensor_id'] not in WHITELIST_IDS:
        return "Unauthorized sensor."

    try:
        decrypted = aes_decrypt(aes_key, sensor_data['payload'])
        log_event(sensor_data['sensor_id'], decrypted)
        # Simulate threat detection
        if sensor_data['type'] == 'threat':
            data = json.loads(decrypted)
            if any([data['motion'], data['intrusion']]):
                print("⚠️ Threat Alert Triggered!")
        return decrypted
    except Exception as e:
        return f"Decryption failed: {str(e)}"

def log_event(sensor_id, data):
    with open("gateway_logs.json", "a") as f:
        f.write(json.dumps({
            "timestamp": time.time(),
            "sensor_id": sensor_id,
            "data": json.loads(data)
        }) + "\n")
