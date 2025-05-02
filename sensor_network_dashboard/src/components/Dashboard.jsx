import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Dashboard() {
    const [sensorData, setSensorData] = useState([]);
    const [log, setLog] = useState([]);
    const [alert, setAlert] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const [selectedSensor, setSelectedSensor] = useState("");
    const [selectedMetric, setSelectedMetric] = useState("temperature");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const downloadLogs = () => {
        const blob = new Blob([JSON.stringify(log, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sensor_logs.json";
        a.click();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://127.0.0.1:8000/dashboard/data", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSensorData(res.data.sensors);
                setLog((prev) => [...prev, ...res.data.sensors]);

                const threatDetected = res.data.sensors.some((sensor) => {
                    return (
                        sensor.data &&
                        (sensor.data.Intrusion || sensor.data["Intrusion Alert"])
                    );
                });
                setAlert(threatDetected ? "⚠️ Threat sensor alert detected!" : null);
            } catch (err) {
                console.error("Failed to fetch sensor data", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Organize sensor data by type
    const sensorMap = {};
    sensorData.forEach((sensor) => {
        const type = sensor.type || sensor.sensor_id?.split("_")[0] || "unknown";
        if (!sensorMap[type]) sensorMap[type] = [];
        if (!sensorMap[type].includes(sensor.sensor_id)) {
            sensorMap[type].push(sensor.sensor_id);
        }
    });

    // For chart (optional)
    const sensorsOfType = selectedType ? sensorMap[selectedType] || [] : [];
    const filteredData = sensorData.filter(
        (d) => d.sensor_id === selectedSensor
    );
    const chartLabels = filteredData.map((d) =>
        new Date(d.timestamp).toLocaleTimeString()
    );
    const chartValues = filteredData.map((d) => d.data[selectedMetric]);

    const lineChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: `${selectedMetric} over time`,
                data: chartValues,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                tension: 0.3,
            },
        ],
    };

    const barChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: `${selectedMetric} (bar)`,
                data: chartValues,
                backgroundColor: "rgba(153,102,255,0.5)",
            },
        ],
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Sensor Dashboard</h2>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={downloadLogs} style={{ marginLeft: "10px" }}>
                Download Logs
            </button>
            {alert && <p style={{ color: "red", fontWeight: "bold" }}>{alert}</p>}

            {/* Dynamic Sensor Summary Cards */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginTop: "20px",
                    justifyContent: "center",
                }}
            >
                {Object.entries(sensorMap).map(([type, ids]) => {
                    const sensorsOfType = sensorData
                        .filter((sensor) => ids.includes(sensor.sensor_id))
                        .sort(
                            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                        ); // Most recent first

                    return (
                        <div
                            key={type}
                            style={{
                                flex: "1 1 300px",
                                background: "#f9f9f9",
                                borderRadius: "12px",
                                padding: "16px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                minWidth: "280px",
                                maxWidth: "350px",
                            }}
                        >
                            <h3 style={{ textTransform: "capitalize", marginBottom: "12px" }}>
                                {type.replace("_", " ")} Sensors
                            </h3>
                            <ul
                                style={{
                                    listStyle: "none",
                                    paddingLeft: 0,
                                    margin: 0,
                                }}
                            >
                                {sensorsOfType.map(({ sensor_id, data, timestamp }) => (
                                    <li
                                        key={sensor_id + timestamp}
                                        style={{
                                            marginBottom: "14px",
                                            borderBottom: "1px solid #eee",
                                            paddingBottom: "10px",
                                        }}
                                    >
                                        <strong>{sensor_id}</strong>
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "#333",
                                                marginTop: "4px",
                                            }}
                                        >
                                            {data &&
                                                Object.entries(data).map(([key, value]) => {
                                                    const isHigh =
                                                        typeof value === "number" && value > 75;
                                                    return (
                                                        <div
                                                            key={key}
                                                            style={{
                                                                color: isHigh ? "red" : "#333",
                                                            }}
                                                        >
                                                            {key}: <b>{String(value)}</b>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#888",
                                                marginTop: "4px",
                                            }}
                                        >
                                            {new Date(timestamp).toLocaleTimeString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Optional Chart View */}
            <div style={{ marginTop: "40px" }}>
                <h4>Chart Viewer (optional)</h4>
                <div style={{ margin: "20px 0" }}>
                    <label>Sensor Type: </label>
                    <select
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            setSelectedSensor("");
                        }}
                        value={selectedType}
                    >
                        <option value="">-- Choose Sensor Type --</option>
                        {Object.keys(sensorMap).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    <label style={{ marginLeft: "20px" }}>Sensor: </label>
                    <select
                        onChange={(e) => setSelectedSensor(e.target.value)}
                        value={selectedSensor}
                        disabled={!selectedType}
                    >
                        <option value="">-- Choose Sensor --</option>
                        {sensorsOfType.map((id) => (
                            <option key={id} value={id}>
                                {id}
                            </option>
                        ))}
                    </select>

                    <label style={{ marginLeft: "20px" }}>Metric: </label>
                    <select
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        value={selectedMetric}
                    >
                        <option value="temperature">Temperature</option>
                        <option value="moisture">Moisture</option>
                        <option value="pH">pH</option>
                        <option value="humidity">Humidity</option>
                        <option value="chlorophyll">Chlorophyll</option>
                    </select>
                </div>

                <div style={{ maxWidth: "800px", margin: "20px auto" }}>
                    <Line data={lineChartData} />
                    <Bar data={barChartData} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
