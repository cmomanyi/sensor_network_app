import json, time
from crypto_utils import aes_decrypt
from crypto_utils import ecc_verify, aes_decrypt
from security_utils import is_valid_request, is_sensor_authorized

WHITELIST_IDS = set()

def process_sensor_payload(payload):
    if not is_sensor_authorized(payload["sensor_id"]):
        raise HTTPException(status_code=403, detail="Unauthorized sensor")

    # ECC spoofing check
    public_key = get_public_key(payload["sensor_id"])
    raw_data = aes_decrypt(payload["aes_nonce"], payload["encrypted_data"], SHARED_AES_KEY)
    if not ecc_verify(public_key, raw_data.encode(), payload["signature"]):
        raise HTTPException(status_code=400, detail="Invalid ECC signature")

    # Nonce + timestamp replay attack check
    parsed = json.loads(raw_data)
    timestamp = datetime.fromisoformat(parsed["timestamp"])
    if not is_valid_request(timestamp, parsed["nonce"]):
        raise HTTPException(status_code=408, detail="Replay attack detected")

    log_data(parsed)
    return parsed

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
