from crypto_utils import generate_ecc_key_pair, save_private_key, save_public_key

sensor_id = "plant_01"

private_key, public_key = generate_ecc_key_pair()
save_private_key(private_key, f"keys/{sensor_id}_priv.pem")
save_public_key(public_key, f"keys/{sensor_id}_pub.pem")

print(f"🔑 ECC keys for sensor '{sensor_id}' saved.")
