from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature, encode_dss_signature
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# ==========================
# ECC Key Generation & Serialization
# ==========================

def generate_ecc_private_key():
    return ec.generate_private_key(ec.SECP256R1())

def get_ecc_public_key(private_key):
    return private_key.public_key()

def serialize_public_key(public_key):
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

def load_public_key(pem_data):
    return serialization.load_pem_public_key(pem_data)

def serialize_private_key(private_key):
    return private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

def load_private_key(pem_data):
    return serialization.load_pem_private_key(pem_data, password=None)

# ==========================
# ECC Signature (Spoofing Protection)
# ==========================

def ecc_sign(private_key, message_bytes: bytes) -> bytes:
    signature = private_key.sign(message_bytes, ec.ECDSA(hashes.SHA256()))
    return signature

def ecc_verify(public_key, message_bytes: bytes, signature: bytes) -> bool:
    try:
        public_key.verify(signature, message_bytes, ec.ECDSA(hashes.SHA256()))
        return True
    except Exception:
        return False

# ==========================
# AES-GCM (Confidentiality)
# ==========================

def generate_aes_key() -> bytes:
    return AESGCM.generate_key(bit_length=128)

def aes_encrypt(plaintext: bytes, key: bytes) -> tuple[bytes, bytes]:
    nonce = os.urandom(12)  # AES-GCM standard nonce size
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return nonce, ciphertext

def aes_decrypt(nonce: bytes, ciphertext: bytes, key: bytes) -> str:
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode()

# ==========================
# Key Agreement (Optional ECC + AES setup)
# ==========================

def derive_shared_key(private_key, peer_public_key) -> bytes:
    shared_secret = private_key.exchange(ec.ECDH(), peer_public_key)
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=16,  # 128 bits
        salt=None,
        info=b"gateway-sensor",
    ).derive(shared_secret)
    return derived_key
