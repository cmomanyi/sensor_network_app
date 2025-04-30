import json

def receive_data_from_gateway(data):
    with open("cloud_api_storage.json", "a") as f:
        f.write(json.dumps(data) + "\n")
    print("✅ Data received by cloud API.")
