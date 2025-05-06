import React, { useState } from "react";
import Layout from "../components/Layout";

const SENSOR_TYPES = {
    soil: ["moisture", "temperature", "pH", "nitrogen", "phosphorus"],
    atmospheric: ["air_temp", "humidity", "co2", "wind_speed", "rainfall"],
    plant: ["leaf_moisture", "chlorophyll", "growth_rate", "disease_risk", "stem_diameter"],
    threat: ["unauthorized_access", "jamming", "tampering", "spoofing", "anomaly_score"],
    water: ["flow_rate", "water_level", "salinity", "ph", "turbidity"],
};

const AUTHORIZED_SENSORS = [
    "Soil_01", "Soil_02", "Atmo_01", "Plant_01", "Water_01", "Threat_01"
];

const EXAMPLE_VALUES = {
    pH: 6.8,
    temperature: 22,
    air_temp: 25,
    moisture: 45,
    co2: 350,
    nitrogen: 20,
    disease_risk: 0.2,
    unauthorized_access: 0,
    anomaly_score: 0.5,
    ph: 7.2,
    flow_rate: 10,
};

const DisplayMetrix = () => {
    const [sensorType, setSensorType] = useState("soil");
    const [sensorId, setSensorId] = useState("Soil_01");
    const [sensorNonce, setSensorNonce] = useState("");
    const [payload, setPayload] = useState("{}");
    const [response, setResponse] = useState(null);
    const [replayCheck, setReplayCheck] = useState({});

    const fields = SENSOR_TYPES[sensorType];

    const examplePayload = fields.reduce((acc, key) => {
        acc[key] = EXAMPLE_VALUES[key] || 1;
        return acc;
    }, {});

    const handleSubmit = (e) => {
        e.preventDefault();
        let parsedPayload;

        try {
            parsedPayload = JSON.parse(payload);
        } catch (err) {
            setResponse({ error: "Invalid JSON format in payload" });
            return;
        }

        if (!AUTHORIZED_SENSORS.includes(sensorId)) {
            setResponse({ error: "Sensor not authorized" });
            return;
        }

        if (replayCheck[sensorNonce]) {
            setResponse({ error: "Replay attack detected" });
            return;
        }

        if (payload.includes("tamper")) {
            setResponse({ error: "Decryption failed" });
            return;
        }

        if (payload.includes("fakesign")) {
            setResponse({ error: "ECC signature verification failed" });
            return;
        }

        for (const key of fields) {
            const val = parsedPayload[key];
            if (val === undefined) {
                setResponse({ error: `Missing sensor field: "${key}"` });
                return;
            }

            // Specific validation for pH
            if (key.toLowerCase() === "pH" || key.toLowerCase() === "ph") {
                if (val < 5.5 || val > 8.5) {
                    setResponse({ error: `Invalid pH range: ${val} (expected 5.5–8.5)` });
                    return;
                }
            }
        }

        setReplayCheck((prev) => ({ ...prev, [sensorNonce]: Date.now() }));
        setResponse({ success: "Sensor data accepted", data: parsedPayload });
    };

    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">IoE Sensor Test Simulator</h2>

                <div className="bg-gray-100 p-4 rounded shadow-md">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="block font-medium">Sensor Type:</label>
                            <select
                                className="border p-1 w-full"
                                value={sensorType}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    setSensorType(type);
                                    setSensorId(
                                        type.charAt(0).toUpperCase() + type.slice(1) + "_01"
                                    );
                                    setPayload(JSON.stringify(
                                        SENSOR_TYPES[type].reduce((acc, k) => {
                                            acc[k] = EXAMPLE_VALUES[k] || 1;
                                            return acc;
                                        }, {}), null, 2)
                                    );
                                }}
                            >
                                {Object.keys(SENSOR_TYPES).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Sensor ID:</label>
                            <input
                                className="border p-1 w-full"
                                value={sensorId}
                                onChange={(e) => setSensorId(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Nonce:</label>
                            <input
                                className="border p-1 w-full"
                                value={sensorNonce}
                                onChange={(e) => setSensorNonce(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Payload (JSON):</label>
                            <textarea
                                rows={6}
                                className="border p-2 w-full font-mono"
                                value={payload}
                                onChange={(e) => setPayload(e.target.value)}
                            />
                        </div>

                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                            type="submit"
                        >
                            Send Test Request
                        </button>
                    </form>

                    {/* Example JSON */}
                    <div className="mt-4 text-sm">
                        <p className="font-semibold mb-1">Example Payload:</p>
                        <pre className="bg-white border p-2 rounded overflow-x-auto">
              {JSON.stringify(examplePayload, null, 2)}
            </pre>
                    </div>

                    {/* Response Display */}
                    {response && (
                        <div className="mt-4 p-2 border bg-white rounded">
                            <pre>{JSON.stringify(response, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DisplayMetrix;
