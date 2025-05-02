
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/login", {
                username,
                password,
            });
            localStorage.setItem("token", response.data.access_token);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Secure IoE Dashboard Login</h2>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}

export default Login;
