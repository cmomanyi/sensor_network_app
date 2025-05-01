import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [sensorType, setSensorType] = useState('plant');
    const [sensorData, setSensorData] = useState(null);

    const fetchSensorData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/sensor/${sensorType}`);
            setSensorData(response.data);
        } catch (error) {
            console.error("Error fetching sensor data:", error);
        }
    };

    return (
        <div>
            <h1>Sensor Dashboard</h1>
            <select value={sensorType} onChange={(e) => setSensorType(e.target.value)}>
                <option value="plant">Plant Sensor</option>
                <option value="soil">Soil Sensor</option>
                {/* Add other sensor types */}
            </select>
            <button onClick={fetchSensorData}>Fetch Data</button>
            {sensorData && (
                <div>
                    <h2>Data:</h2>
                    <pre>{JSON.stringify(sensorData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;
