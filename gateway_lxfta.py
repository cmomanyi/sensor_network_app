import json
import time
from crypto_utils import verify_signature, decrypt_data
from api_simulator import send_to_cloud_api

AUTHORIZED_SENSORS = {
    "sensor_plant_01": {"public_key": None, "aes_key": b'secret_aes_key_plant'},
    "sensor_soil_01": {"public_key": None, "aes_key": b'secret_aes_key_soil'},
    # Add other authorized sensors
}

used_nonces = set()

def process_sensor_data(sensor_payload):
    sensor_id = sensor_payload["sensor_id"]
    if sensor_id not in AUTHORIZED_SENSORS:
        print("Unauthorized sensor.")
        return

    aes_key = AUTHORIZED_SENSORS[sensor_id]["aes_key"]
    public_key = AUTHORIZED_SENSORS[sensor_id]["public_key"]

    nonce = bytes.fromhex(sensor_payload["nonce"])
    encrypted_data = bytes.fromhex(sensor_payload["encrypted_data"])
    signature = bytes.fromhex(sensor_payload["signature"])

    try:
        decrypted_data = decrypt_data(aes_key, nonce, encrypted_data)
        if not verify_signature(public_key, decrypted_data, signature):
            print("Signature verification failed.")
            return

        data = json.loads(decrypted_data)
        timestamp = data["timestamp"]
        nonce_value = data["nonce"]

        if nonce_value in used_nonces or abs(time.time() - timestamp) > 30:
            print("Replay attack detected.")
            return

        used_nonces.add(nonce_value)
        log_data(data)
        send_to_cloud_api(data)

    except Exception as e:
        print(f"Error processing data: {e}")

def log_data(data):
    with open("gateway_log.json", "a") as log_file:
        json.dump(data, log_file)
        log_file.write("\n")
