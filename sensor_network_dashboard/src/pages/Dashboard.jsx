import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    LineChart,
    Line,
    Legend,
    ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout";

const Dashboard = () => {
    const [sensorData, setSensorData] = useState([]);
    const [sensorTypes, setSensorTypes] = useState({});
    const [selectedType, setSelectedType] = useState("");
    const [sensorIDs, setSensorIDs] = useState([]);
    const [selectedSensorID, setSelectedSensorID] = useState("");
    const [averageData, setAverageData] = useState({});
    const [lineChartData, setLineChartData] = useState([]);
    const [log, setLog] = useState([]);
    const [alert, setAlert] = useState(null);
    const [threatLogs, setThreatLogs] = useState([]);
    const [searchTimestamp, setSearchTimestamp] = useState("");

    // Fetch sensor types
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await axios.get("http://127.0.0.1:8000/dashboard/types");
                setSensorTypes(res.data.types);

                const types = Object.keys(res.data.types);
                if (types.length === 1) {
                    setSelectedType(types[0]);
                }
            } catch (err) {
                console.error("Failed to fetch sensor types", err);
            }
        };
        fetchTypes();
    }, []);

    // Fetch sensor data repeatedly
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://127.0.0.1:8000/dashboard/data", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSensorData(res.data.sensors);

                const updatedLog = [...log, ...res.data.sensors];
                setLog(updatedLog);
                localStorage.setItem("sensor_logs", JSON.stringify(updatedLog, null, 2));

                const threats = res.data.sensors.filter(
                    (sensor) =>
                        sensor.data?.Intrusion ||
                        sensor.data?.["Intrusion Alert"] ||
                        sensor.type === "threat"
                );
                setThreatLogs(threats);
                setAlert(threats.length > 0 ? "⚠️ Threat sensor alert detected!" : null);
            } catch (err) {
                console.error("Failed to fetch sensor data", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [log]);

    // Compute average values per sensor type
    useEffect(() => {
        const typeGroups = {};
        const idGroups = {};

        sensorData.forEach((sensor) => {
            const { type, id, data } = sensor;
            if (!typeGroups[type]) typeGroups[type] = [];
            if (!idGroups[type]) idGroups[type] = new Set();
            typeGroups[type].push(data);
            idGroups[type].add(id);
        });

        const averages = {};
        Object.keys(typeGroups).forEach((type) => {
            const readings = typeGroups[type];
            const sum = {};
            const count = readings.length;

            readings.forEach((reading) => {
                Object.entries(reading).forEach(([key, value]) => {
                    if (typeof value === "number") {
                        sum[key] = (sum[key] || 0) + value;
                    }
                });
            });

            averages[type] = Object.keys(sum).map((key) => ({
                name: key,
                value: parseFloat((sum[key] / count).toFixed(2)),
            }));
        });

        setAverageData(averages);
        if (selectedType && idGroups[selectedType]) {
            setSensorIDs(Array.from(idGroups[selectedType]));
        }
    }, [sensorData, selectedType]);

    // Filter line chart data for selected sensor ID
    useEffect(() => {
        if (!selectedSensorID) return;
        const dataPoints = log
            .filter((sensor) => sensor.id === selectedSensorID)
            .map((sensor) => ({
                timestamp: sensor.timestamp,
                ...sensor.data,
            }));
        setLineChartData(dataPoints);
    }, [selectedSensorID, log]);

    const filteredLogs = log.filter((entry) =>
        entry.timestamp.includes(searchTimestamp.trim())
    );

    return (
        <Layout>
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold mb-4">🌿 My Farm metrics</h1>

                {alert && (
                    <div className="bg-red-100 text-red-700 p-4 rounded relative group">
                        {alert}
                        <div className="hidden group-hover:block absolute z-10 bg-white text-black shadow-md border mt-2 p-3 rounded max-h-60 overflow-y-auto w-96">
                            <strong>Threat Logs:</strong>
                            <ul className="text-sm mt-2 space-y-1">
                                {threatLogs.map((log, idx) => (
                                    <li key={idx}>{log.timestamp} - {log.type} - ID: {log.id}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3">
                        <label className="block font-medium mb-1">Sensor Type</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setSelectedSensorID("");
                            }}
                        >
                            <option value="">Select Type</option>
                            {Object.keys(sensorTypes).map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>


                </div>

                {selectedType && averageData[selectedType] && (
                    <div className="bg-white rounded-xl shadow p-4">
                        <h2 className="text-xl font-semibold mb-3">Average Metrics: {selectedType}</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={averageData[selectedType]}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" fill="#4F46E5" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {lineChartData.length > 0 && (
                    <div className="bg-white rounded-xl shadow p-4 mt-6">
                        <h2 className="text-xl font-semibold mb-3">Live Sensor Line Chart</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <XAxis dataKey="timestamp" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    {Object.keys(lineChartData[0] || {}).filter(k => k !== "timestamp").map((key) => (
                                        <Line key={key} type="monotone" dataKey={key} stroke="#6366F1" strokeWidth={2} dot={false} />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder="Search logs by timestamp (YYYY-MM)..."
                            value={searchTimestamp}
                            onChange={(e) => setSearchTimestamp(e.target.value)}
                            className="w-full md:w-1/3 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
                        />
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow max-h-96 overflow-auto">
                        <h2 className="text-xl font-semibold mb-3">📜 Sensor Logs</h2>
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(filteredLogs, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
