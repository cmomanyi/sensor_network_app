


/**
 * Fetch data from the soil sensor endpoint
 * @returns {Promise<Object>}
 */
export const fetchAllSoilSensors = async () => {
    const response = await fetch("http://localhost:8000/api/soil");
    return response.json();
};

/**
 * Fetch data from the atmospheric sensor endpoint
 * @returns {Promise<Object>}
 */
export const fetchAllAtmosphericSensors = async () => {
    const response = await fetch("http://localhost:8000/api/atmosphere");
    return response.json();
};

