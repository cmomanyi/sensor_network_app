// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://127.0.0.1:8000/dashboard/data", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSensorData(res.data.sensors);
                const newLog = [...log, ...res.data.sensors];
                setLog(newLog);
                localStorage.setItem("sensor_logs", JSON.stringify(newLog, null, 2));

                const threatDetected = res.data.sensors.some(
                    (sensor) => sensor.data?.Intrusion || sensor.data?.["Intrusion Alert"]
                );
                setAlert(threatDetected ? "⚠️ Threat sensor alert detected!" : null);
            } catch (err) {
                console.error("Failed to fetch sensor data", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const sensorMap = {};
    sensorData.forEach((sensor) => {
        const type = sensor.type || sensor.sensor_id?.split("_")[0] || "unknown";
        if (!sensorMap[type]) sensorMap[type] = [];
        if (!sensorMap[type].includes(sensor.sensor_id)) {
            sensorMap[type].push(sensor.sensor_id);
        }
    });

    const sensorsOfType = selectedType ? sensorMap[selectedType] || [] : [];
    const filteredData = sensorData.filter((d) => d.sensor_id === selectedSensor);
    const chartLabels = filteredData.map((d) => new Date(d.timestamp).toLocaleTimeString());
    const chartValues = filteredData.map((d) => d.data[selectedMetric]);

    const lineChartData = {
        labels: chartLabels,
        datasets: [
            {
                label: `${selectedMetric} over time`,
                data: chartValues,
                borderColor: "#36A2EB",
                backgroundColor: "rgba(54,162,235,0.2)",
                tension: 0.3,
            },
        ],
    };

    return (
        <Layout>
            <section>
                <h2 style={{ marginBottom: "10px" }}>Sensor Dashboard</h2>
                {alert && <div style={{ color: "red", fontWeight: "bold", marginBottom: "10px" }}>{alert}</div>}

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "20px",
                        marginBottom: "20px",
                    }}
                >
                    <div>
                        <label>Sensor Type: </label>
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setSelectedSensor("");
                            }}
                        >
                            <option value="">-- Choose Type --</option>
                            {Object.keys(sensorMap).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Sensor ID: </label>
                        <select
                            value={selectedSensor}
                            onChange={(e) => setSelectedSensor(e.target.value)}
                            disabled={!selectedType}
                        >
                            <option value="">-- Choose Sensor --</option>
                            {sensorsOfType.map((id) => (
                                <option key={id} value={id}>
                                    {id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Metric: </label>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                        >
                            <option value="temperature">Temperature</option>
                            <option value="moisture">Moisture</option>
                            <option value="pH">pH</option>
                            <option value="humidity">Humidity</option>
                            <option value="chlorophyll">Chlorophyll</option>
                        </select>
                    </div>
                </div>

                <div style={{ maxWidth: "800px", margin: "auto" }}>
                    {selectedSensor ? (
                        <Line data={lineChartData} />
                    ) : (
                        <p style={{ textAlign: "center" }}>Select a sensor to view its data chart.</p>
                    )}
                </div>
            </section>
        </Layout>
    );
}

export default Dashboard