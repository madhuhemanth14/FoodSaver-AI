import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Leaf, ArrowLeft } from "lucide-react";
import heroImage from "../assets/hero-food.png";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login data:", formData);

    // Later you can connect your backend authentication here.
  };

  return (
    <div className="auth-page">

      {/* ================= LEFT SIDE ================= */}
      <div className="auth-form-section">

        <div className="auth-form-container">

          {/* Logo */}
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <Leaf size={25} />
            </div>

            <span>
              FoodSaver <b>AI</b>
            </span>
          </Link>

          {/* Back */}
          <Link to="/" className="back-home">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="auth-heading">
            <h1>Welcome back</h1>

            <p>
              Log in to manage donations, pickups, and NGO matches.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="form-options">

              <label className="remember-me">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>

            {/* Login */}
            <button
              type="submit"
              className="auth-submit"
            >
              Log In
            </button>

          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup">
              Sign up
            </Link>
          </p>

        </div>
      </div>


      {/* ================= RIGHT SIDE ================= */}
      <div className="auth-visual-section">

        <div className="auth-visual-content">

          <img
            src={heroImage}
            alt="FoodSaver AI food donation"
            className="auth-food-image"
          />

          <h2>
            Every login moves food from
            surplus to someone's plate
          </h2>

          <p>
            Track pickups, see AI-verified food quality,
            and connect with the nearest NGO — all from
            your FoodSaver AI account.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;