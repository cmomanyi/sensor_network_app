import React, { useEffect, useState } from "react";
import { fetchSoilData, fetchAtmosphericData } from "../api/api";

const SensorDashboard = () => {
    const [soil, setSoil] = useState(null);
    const [atmosphere, setAtmosphere] = useState(null);

    useEffect(() => {
        fetchSoilData().then(setSoil);
        fetchAtmosphericData().then(setAtmosphere);
    }, []);

    return (
        <div>
            <h2>Sensor Dashboard</h2>

            {soil && (
                <div>
                    <h3>Soil Sensor</h3>
                    <pre>{JSON.stringify(soil, null, 2)}</pre>
                </div>
            )}

            {atmosphere && (
                <div>
                    <h3>Atmospheric Sensor</h3>
                    <pre>{JSON.stringify(atmosphere, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default SensorDashboard;
