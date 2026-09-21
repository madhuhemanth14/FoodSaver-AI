import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Leaf, ArrowLeft } from "lucide-react";
import heroImage from "../assets/hero-food.png";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { roleLoginLandingPath } from "../utils/roles";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const justRegistered = Boolean(location.state?.justRegistered);

  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ROLE_OPTIONS = [
    { value: "donor", label: "Food Donor" },
    { value: "ngo", label: "NGO" },
    { value: "admin", label: "Admin" },
  ];

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!selectedRole) {
      setLoginError("Please select your account type.");
      return;
    }

    if (!formData.email.trim()) {
      setLoginError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setLoginError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      const { token, user } = await loginUser({
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });

      login(user, token);

      const landingPath = roleLoginLandingPath(user.role);

      navigate(landingPath, {
        replace: true,
      });
    } catch (err) {
      setLoginError(
        err.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-section">
        <div className="auth-form-container">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <Leaf size={25} />
            </div>

            <span>
              FoodSaver <b>AI</b>
            </span>
          </Link>

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

          <form onSubmit={handleSubmit} className="auth-form">
            {justRegistered && (
              <p className="auth-success-banner">
                Account created — log in to continue.
              </p>
            )}

            {loginError && (
              <p className="auth-error-banner">
                {loginError}
              </p>
            )}

            <div className="form-group">
              <label htmlFor="loginRole">
                Log in as
              </label>

              <select
                id="loginRole"
                name="loginRole"
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value)
                }
              >
                <option value="" disabled>
                  Select User Type
                </option>

                {ROLE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
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

              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting}
            >
              {submitting
                ? "Logging in..."
                : "Log In"}
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

