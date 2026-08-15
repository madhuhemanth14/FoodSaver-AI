import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
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

import NGOMap from "./pages/map/NGOMapPage";


/* =========================
   PICKUP PAGES
========================= */

import PickupRequest from "./pages/pickup/PickupRequest";
import PickupTracking from "./pages/pickup/PickupTracking";
import PickupHistory from "./pages/pickup/PickupHistory";


/* =========================
   HOME PAGE
========================= */

const Home = () => {
  return (
    <>
      <Navbar />

      <main>

        {/* Hero Section */}
        <Hero />

        {/* About Section */}
        <About />

        {/* How It Works */}
        <HowItWorks />

        {/* Statistics */}
        <Stats />

        {/* Why It Matters */}
        <WhyItMatters />

        {/* Call To Action */}
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

      </Routes>

    </BrowserRouter>
  );
};


export default App;