from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os, time, hashlib
from datetime import datetime

used_nonces = set()

# Organize authorized sensors by type
AUTHORIZED_SENSORS = {
    "soil": {"soil_01", "soil_02", "soil_03", "soil_04", "soil_05"},
    "plant": {"plant_01", "plant_02", "plant_03", "plant_04", "plant_05"},
    "threat": {"threat_01", "threat_02", "threat_03", "gitthreat_04", "threat_05"},
    "water": {"water_01", "water_02", "water_03", "water_04", "water_05"},
    "atmospheric": {"atmospheric_01", "atmospheric_02", "atmospheric_03", "atmospheric_04", "atmospheric_05"},

}


class CryptoUtils:
    @staticmethod
    def verify_signature(public_key, data, signature):
        try:
            public_key.verify(signature, data, ec.ECDSA(hashes.SHA256()))
            return True
        except Exception as e:
            print(f"Signature verification failed: {e}")
            return False

    @staticmethod
    def is_valid_request(timestamp, nonce):
        now = datetime.utcnow()
        if nonce in used_nonces:
            return False
        if abs((now - timestamp).total_seconds()) > 30:
            return False
        used_nonces.add(nonce)
        return True

    @staticmethod
    def encrypt_data(data, key):
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        encrypted = aesgcm.encrypt(nonce, data.encode(), None)
        return nonce, encrypted

    @staticmethod
    def decrypt_data(nonce, encrypted, key):
        aesgcm = AESGCM(key)
        return aesgcm.decrypt(nonce, encrypted, None).decode()

    @staticmethod
    def is_sensor_authorized(sensor_id):
        """
        Check if the sensor ID is authorized based on the sensor's type.
        """
        # Extract the sensor type from the ID (before the first underscore)
        sensor_type = sensor_id.split("_")[0]

        # Check if the sensor type exists and if the sensor ID is in the list of authorized sensors
        if sensor_type in AUTHORIZED_SENSORS:
            return sensor_id in AUTHORIZED_SENSORS[sensor_type]
        return False

    @staticmethod
    def compute_config_hash(filepath):
        with open(filepath, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
