import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Settings() {
    const [profile, setProfile] = useState(null);
    const [downloads, setDownloads] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSettingsData = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const [profileRes, downloadsRes, statsRes] = await Promise.all([
                    axios.get("http://127.0.0.1:8000/api/profile", config),
                    axios.get("http://127.0.0.1:8000/api/downloads", config),
                    axios.get("http://127.0.0.1:8000/api/stats", config),
                ]);

                setProfile(profileRes.data);
                setDownloads(downloadsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Error loading settings:", err);
                setError("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettingsData();
    }, []);

    return (
        <Layout>
            <section>
                <h2>Settings & Account Overview</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <>
                        {/* Profile Info */}
                        <div style={cardStyle}>
                            <h3>👤 Profile</h3>
                            <p><strong>Username:</strong> {profile?.username}</p>
                            <p><strong>Email:</strong> {profile?.email}</p>
                            <p><strong>Role:</strong> {profile?.role}</p>
                        </div>

                        {/* Download History */}
                        <div style={cardStyle}>
                            <h3>⬇️ Download History</h3>
                            {downloads.length > 0 ? (
                                <ul>
                                    {downloads.map((item, idx) => (
                                        <li key={idx}>
                                            {item.filename} — <small>{new Date(item.timestamp).toLocaleString()}</small>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No downloads yet.</p>
                            )}
                        </div>

                        {/* User Statistics */}
                        <div style={cardStyle}>
                            <h3>📊 Login Stats</h3>
                            <p><strong>Total Users:</strong> {stats?.total_users}</p>
                            <p><strong>Active Today:</strong> {stats?.active_today}</p>
                            <p><strong>Total Logins:</strong> {stats?.total_logins}</p>
                        </div>
                    </>
                )}
            </section>
        </Layout>
    );
}

const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

export default Settings;
