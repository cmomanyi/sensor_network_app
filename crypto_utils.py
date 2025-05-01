import os
import hashlib
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization

from cryptography.hazmat.primitives.asymmetric.utils import (
    encode_dss_signature,
    decode_dss_signature
)

from cryptography.hazmat.primitives.serialization import (
    Encoding, PrivateFormat, PublicFormat, NoEncryption,
    load_pem_private_key
)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidSignature


# --- ECC Key Generation & Signing ---

def generate_ecc_key_pair():
    """Generate a new ECC private/public key pair"""
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    return private_key, public_key


def sign_data(private_key, data: bytes):
    """Sign data with ECC private key"""
    signature = private_key.sign(data, ec.ECDSA(hashes.SHA256()))
    return signature


def verify_signature(public_key, data: bytes, signature: bytes):
    """Verify ECC signature"""
    try:
        public_key.verify(signature, data, ec.ECDSA(hashes.SHA256()))
        return True
    except InvalidSignature:
        return False
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False


def serialize_public_key(public_key):
    """Serialize public key to bytes"""
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )


def load_public_key(pem_data: bytes):
    """Load a public key from PEM bytes"""
    return serialization.load_pem_public_key(pem_data)


# --- AES-GCM Encryption/Decryption ---

def derive_aes_key(seed: bytes) -> bytes:
    """Derive 128-bit AES key from a shared seed"""
    return hashlib.sha256(seed).digest()[:16]  # 16 bytes = 128 bits


def encrypt_data(data: str, key: bytes):
    """Encrypt plaintext string with AES-GCM"""
    if len(key) not in [16, 24, 32]:
        raise ValueError("AES key must be 128, 192, or 256 bits.")
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # Recommended nonce size for GCM
    ciphertext = aesgcm.encrypt(nonce, data.encode(), None)
    return nonce, ciphertext


def decrypt_data(nonce: bytes, ciphertext: bytes, key: bytes) -> str:
    """Decrypt AES-GCM encrypted data"""
    if len(key) not in [16, 24, 32]:
        raise ValueError("AES key must be 128, 192, or 256 bits.")
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None).decode()


def save_private_key(private_key, filepath):
    """Save ECC private key to a PEM file"""
    with open(filepath, 'wb') as f:
        f.write(private_key.private_bytes(
            encoding=Encoding.PEM,
            format=PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=NoEncryption()
        ))


def load_private_key(filepath):
    """Load ECC private key from a PEM file"""
    with open(filepath, 'rb') as f:
        return load_pem_private_key(f.read(), password=None)


def save_public_key(public_key, filepath):
    """Save ECC public key to a PEM file"""
    with open(filepath, 'wb') as f:
        f.write(serialize_public_key(public_key))


def load_public_key_file(filepath):
    """Load ECC public key from PEM file"""
    with open(filepath, 'rb') as f:
        return load_public_key(f.read())
