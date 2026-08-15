import React from "react";
import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to="/" className="logo">
        <div className="logo-icon">
          <Leaf size={24} />
        </div>

        <span>
          FoodSaver <b>AI</b>
        </span>
      </Link>


      {/* Navigation Links */}
      <div className="nav-links">

        <Link
          to="/"
          className="active"
        >
          Home
        </Link>

        <a href="/#about">
          About
        </a>

        <a href="/#how-it-works">
          How It Works
        </a>

        <a href="/#features">
          Features
        </a>

        <a href="/#impact">
          Impact
        </a>

        <a href="/#contact">
          Contact
        </a>

      </div>


      {/* Login / Sign Up */}
      <div className="nav-buttons">

        <Link
          to="/login"
          className="login-btn"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="signup-btn"
        >
          Sign Up
        </Link>

      </div>

    </nav>
  );
};

export default Navbar;