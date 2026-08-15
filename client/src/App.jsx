import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


/* Components */
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import Stats from "./components/Stats";
import WhyItMatters from "./components/WhyItMatters";
import CTA from "./components/CTA";
import Footer from "./components/Footer";


/* Pages */
import Login from "./pages/Login";
import Register from "./pages/Register";


/* =========================================
   HOME PAGE
========================================= */

const Home = () => {
  return (
    <>
      <Navbar />

      <main>

        {/* Hero */}
        <Hero />

        {/* About */}
        <About />

        {/* How FoodSaver AI Works */}
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


/* =========================================
   APP
========================================= */

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ================= REGISTER ================= */}

        <Route
          path="/signup"
          element={<Register />}
        />

      </Routes>

    </BrowserRouter>
  );
};

export default App;