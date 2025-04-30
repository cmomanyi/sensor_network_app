import networkx as nx

def build_sensor_network(num_sensors=5):
    G = nx.Graph()
    G.add_node("gateway", type="gateway")

    for i in range(1, num_sensors + 1):
        sensor_id = f"soil-{i}"
        G.add_node(sensor_id, type="sensor")
        G.add_edge(sensor_id, "gateway")  # Assume all sensors connect directly for now

    return G
