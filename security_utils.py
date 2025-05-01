import hashlib
from collections import deque
from datetime import datetime

used_nonces = set()
AUTHORIZED_SENSORS = {'soil_01', 'plant_02', 'threat_01'}

request_log = deque()
MAX_REQUESTS = 20
TIME_WINDOW = 60  # seconds


def is_valid_request(timestamp, nonce):
    now = datetime.utcnow()
    if nonce in used_nonces:
        return False
    if abs((now - timestamp).total_seconds()) > 30:
        return False
    used_nonces.add(nonce)
    return True


def is_sensor_authorized(sensor_id):
    return sensor_id in AUTHORIZED_SENSORS


def compute_config_hash(filepath):
    with open(filepath, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


original_hash = compute_config_hash('config.json')


def check_for_tampering():
    if compute_config_hash('config.json') != original_hash:
        print("⚠️ ALERT: Gateway config tampering detected!")



def is_rate_limited():
    now = datetime.utcnow()
    request_log.append(now)
    while request_log and (now - request_log[0]).total_seconds() > TIME_WINDOW:
        request_log.popleft()
    if len(request_log) > MAX_REQUESTS:
        print("⚠️ Warning: Rate limit exceeded!")
        return True
    return False
