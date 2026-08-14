import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";

import NGOFinder from "./pages/ngo/NGOFinder";
import NGODetails from "./pages/ngo/NGODetails";
import PickupRequest from "./pages/pickup/PickupRequest";
import PickupTracking from "./pages/pickup/PickupTracking";
import PickupHistory from "./pages/pickup/PickupHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/ngos"
          element={<NGOFinder />}
        />

        <Route
          path="/ngos/details"
          element={<NGODetails />}
        />

        <Route
          path="/pickup/request"
          element={<PickupRequest />}
        />

        <Route
          path="/pickup/tracking"
          element={<PickupTracking />}
        />

        <Route
          path="/pickup/history"
          element={<PickupHistory />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;