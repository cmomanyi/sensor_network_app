import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import SensorDashboard from "./pages/SensorDashboard";
import Login from "./pages/Login";
import DisplayMetrix from "./pages/DisplayMetrix";

function App() {
    return (
        <Router>

                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/sensordashboard" element={<SensorDashboard />} />
                    <Route path="/displaymetrix" element={<DisplayMetrix/>} />
                    {/* Add any other routes like /alerts or /reports here */}
                </Routes>

        </Router>
    );
}

export default App;
