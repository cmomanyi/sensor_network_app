from fastapi import APIRouter
from app.crypto_utils import CryptoUtils
from datetime import datetime

router = APIRouter()

# Simulated symmetric key
KEY = b"0" * 16

@router.post("/sensor/data")
def receive_sensor_data(sensor_id: str, nonce: bytes, encrypted: bytes, timestamp: str):
    if not CryptoUtils.is_sensor_authorized(sensor_id):
        return {"error": "Sensor not authorized"}
    if not CryptoUtils.is_valid_request(datetime.fromisoformat(timestamp), nonce):
        return {"error": "Replay attack detected"}
    try:
        data = CryptoUtils.decrypt_data(nonce, encrypted, KEY)
        return {"status": "Data received", "decrypted_data": data}
    except Exception as e:
        return {"error": str(e)}
