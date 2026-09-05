import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* COMMON */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* HOME */
import Hero from "./components/Hero";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Stats from "./components/Stats";
import WhyItMatters from "./components/WhyItMatters";
import CTA from "./components/CTA";

/* AUTH */
import Login from "./pages/Login";
import Register from "./pages/Register";

/* NGO */
import NGOFinder from "./pages/ngo/NGOFinder";
import NGODetails from "./pages/ngo/NGODetails";
import NGOMap from "./pages/map/NGOMappage";

/* PICKUP */
import PickupRequest from "./pages/pickup/PickupRequest";
import PickupTracking from "./pages/pickup/PickupTracking";
import PickupHistory from "./pages/pickup/PickupHistory";

/* DASHBOARD */
import Dashboard from "./pages/dashboard/Dashboard";
import Notifications from "./pages/dashboard/Notifications";
import Activity from "./pages/dashboard/Activity";

const Home = () => {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Stats />
        <WhyItMatters />
        <CTA />
      </main>

      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/activity" element={<Activity />} />

        {/* PROFILE PLACEHOLDER */}
        <Route
          path="/profile"
          element={
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial, sans-serif",
                color: "#2e7d32",
                background: "#f6f8f6",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div>
                <h2>Profile</h2>
                <p>
                  Profile will be connected through the authentication module.
                </p>
              </div>
            </div>
          }
        />

        {/* NGO */}
        <Route path="/ngos" element={<NGOFinder />} />

        <Route
          path="/ngos/:id"
          element={<NGODetails />}
        />

        {/* MAP */}
        <Route path="/map" element={<NGOMap />} />

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

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;