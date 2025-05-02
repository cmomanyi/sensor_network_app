import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import SensorDashboard from "./pages/SensorDashboard";
import Layout from "./components/Layout";
import Login from "./pages/Login";

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/sensordashboard" element={<SensorDashboard />} />
                    {/* Add any other routes like /alerts or /reports here */}
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
