import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";
import Notifications from "./pages/dashboard/Notifications";
import Profile from "./pages/dashboard/Profile";
import Activity from "./pages/dashboard/Activity";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<Activity />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;