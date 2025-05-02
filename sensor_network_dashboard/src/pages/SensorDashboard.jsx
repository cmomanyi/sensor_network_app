import React, { useEffect, useState } from "react";
import {
    fetchAllSoilSensors,
    fetchAllAtmosphericSensors,
} from "../components/api";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const SensorDashboard = () => {
    const [sensorType, setSensorType] = useState("soil");
    const [sensorIndex, setSensorIndex] = useState(0);
    const [allSensors, setAllSensors] = useState([]);

    useEffect(() => {
        const fetchSensors = async () => {
            let data = [];
            if (sensorType === "soil") {
                data = await fetchAllSoilSensors();
            } else if (sensorType === "atmosphere") {
                data = await fetchAllAtmosphericSensors();
            }
            setAllSensors(data);
            setSensorIndex(0);
        };

        fetchSensors();
        const interval = setInterval(fetchSensors, 10000);
        return () => clearInterval(interval);
    }, [sensorType]);

    const sensorData = allSensors[sensorIndex];

    const renderChart = () => {
        if (!sensorData) return <p>Loading...</p>;

        const labels = sensorType === "soil"
            ? ["Temp", "Moisture", "pH", "Nutrients"]
            : ["Air Temp", "Humidity", "CO₂", "Wind", "Rainfall"];

        const data = sensorType === "soil"
            ? [
                sensorData.temperature,
                sensorData.moisture,
                sensorData.ph,
                sensorData.nutrient_level,
            ]
            : [
                sensorData.air_temperature,
                sensorData.humidity,
                sensorData.co2,
                sensorData.wind_speed,
                sensorData.rainfall,
            ];

        const label = sensorType === "soil" ? "Soil Readings" : "Atmospheric Readings";

        return (
            <>
                <ul>
                    {Object.entries(sensorData).map(([key, value]) => (
                        <li key={key}>
                            {key.replace("_", " ")}: {value}
                        </li>
                    ))}
                </ul>
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label,
                                data,
                                backgroundColor: "rgba(153,102,255,0.4)",
                                borderColor: "rgba(153,102,255,1)",
                                fill: true,
                                tension: 0.3,
                            },
                        ],
                    }}
                />
            </>
        );
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <header style={{ marginBottom: "20px" }}>
                <h1>🌐 Sensor Network Dashboard</h1>

                <div style={{ marginBottom: "10px" }}>
                    <label>
                        Sensor Type:{" "}
                        <select value={sensorType} onChange={(e) => setSensorType(e.target.value)}>
                            <option value="soil">Soil Sensors</option>
                            <option value="atmosphere">Atmospheric Sensors</option>
                        </select>
                    </label>
                </div>

                <div>
                    <label>
                        Select Sensor #:{" "}
                        <select
                            value={sensorIndex}
                            onChange={(e) => setSensorIndex(Number(e.target.value))}
                        >
                            {allSensors.map((_, idx) => (
                                <option key={idx} value={idx}>
                                    Sensor {idx + 1}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </header>

            <main>{renderChart()}</main>
        </div>
    );
};

export default SensorDashboard;
