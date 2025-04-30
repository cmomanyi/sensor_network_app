import hashlib
import time

def generate_token(sensor_id, timestamp):
    raw = f"{sensor_id}-{timestamp}".encode()
    return hashlib.sha256(raw).hexdigest()

def verify_token(sensor_id, timestamp, token):
    expected = generate_token(sensor_id, timestamp)
    return expected == token
