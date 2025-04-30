from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os, base64

# Generate ECC keys
def generate_ecc_key_pair():
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    return private_key, public_key

def serialize_public_key(public_key):
    return public_key.public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo
    )

# AES-GCM Encryption
def aes_encrypt(key, data):
    nonce = os.urandom(12)
    aesgcm = AESGCM(key)
    encrypted = aesgcm.encrypt(nonce, data.encode(), None)
    return base64.b64encode(nonce + encrypted).decode()

def aes_decrypt(key, encrypted_data):
    raw = base64.b64decode(encrypted_data.encode())
    nonce, ciphertext = raw[:12], raw[12:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None).decode()
