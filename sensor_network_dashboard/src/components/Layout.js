// src/components/Layout.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Layout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const downloadLogs = () => {
        const logs = localStorage.getItem("sensor_logs");
        if (!logs) return;
        const blob = new Blob([logs], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sensor_logs.json";
        a.click();
    };

    return (
        <>
            <nav style={{ background: "#222", padding: "10px", color: "#fff", display: "flex", justifyContent: "space-between" }}>
                <div>
                    <Link to="/sensordashboard" style={{ color: "#fff", marginRight: "15px", textDecoration: "none" }}>Dashboard</Link>
                    <Link to="/dashboard" style={{ color: "#fff", marginRight: "15px", textDecoration: "none" }}>MetricsView</Link>
                    <Link to="/settings" style={{ color: "#fff", textDecoration: "none" }}>Settings</Link>

                </div>
                <div>
                    <button onClick={downloadLogs} style={{ marginRight: "10px" }}>Download Logs</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            <main style={{ padding: "20px" }}>{children}</main>
        </>
    );
};

export default Layout;
