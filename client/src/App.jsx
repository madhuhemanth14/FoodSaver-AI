import { Routes, Route } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

import NGOFinder from "./pages/ngo/NGOFinder";
import NGODetails from "./pages/ngo/NGODetails";
import NGOMap from "./pages/map/NGOMappage";

import PickupRequest from "./pages/pickup/PickupRequest";
import PickupTracking from "./pages/pickup/PickupTracking";
import PickupHistory from "./pages/pickup/PickupHistory";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="app-content">
        <Routes>

          {/* NGO */}
          <Route
            path="/ngos"
            element={<NGOFinder />}
          />

          {/* IMPORTANT: MongoDB NGO ID */}
          <Route
            path="/ngos/:id"
            element={<NGODetails />}
          />

          {/* MAP */}
          <Route
            path="/map"
            element={<NGOMap />}
          />

          {/* PICKUP */}
          <Route
            path="/pickup/request"
            element={<PickupRequest />}
          />

          <Route
            path="/pickup/tracking/:id"
            element={<PickupTracking />}
          />

          <Route
            path="/pickup/history"
            element={<PickupHistory />}
          />

        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;