import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* =========================
   COMMON COMPONENTS
========================= */

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/* =========================
   HOME COMPONENTS
========================= */

import Hero from "./components/Hero";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Stats from "./components/Stats";
import WhyItMatters from "./components/WhyItMatters";
import CTA from "./components/CTA";

/* =========================
   AUTH PAGES
========================= */

import Login from "./pages/Login";
import Register from "./pages/Register";

/* =========================
   NGO PAGES
========================= */

import NGOFinder from "./pages/ngo/NGOFinder";
import NGODetails from "./pages/ngo/NGODetails";

/* =========================
   MAP
========================= */

import NGOMap from "./pages/map/NGOMappage";

/* =========================
   PICKUP PAGES
========================= */

import PickupRequest from "./pages/pickup/PickupRequest";
import PickupTracking from "./pages/pickup/PickupTracking";
import PickupHistory from "./pages/pickup/PickupHistory";

/* =========================
   MEMBER 5 - DASHBOARD
========================= */

import Dashboard from "./pages/dashboard/Dashboard";
import Notifications from "./pages/dashboard/Notifications";
import Activity from "./pages/dashboard/Activity";

/*
  Profile is intentionally not imported here yet.
  Your authentication/profile teammate will provide
  the final Profile implementation during integration.
*/

/* =========================
   HOME PAGE
========================= */

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

/* =========================
   APP
========================= */

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =========================
            MEMBER 5 DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/activity"
          element={<Activity />}
        />

        {/* =========================
            PROFILE PLACEHOLDER
            Final profile route will be
            connected during auth integration.
        ========================= */}

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
                  Profile will be connected through the
                  authentication module during team integration.
                </p>
              </div>
            </div>
          }
        />

        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Register />}
        />

        {/* =========================
            NGO
        ========================= */}

        <Route
          path="/ngos"
          element={<NGOFinder />}
        />

        <Route
          path="/ngos/details"
          element={<NGODetails />}
        />

        {/* =========================
            MAP
        ========================= */}

        <Route
          path="/map"
          element={<NGOMap />}
        />

        {/* =========================
            PICKUP
        ========================= */}

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

        {/* =========================
            SAFETY FALLBACK
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;