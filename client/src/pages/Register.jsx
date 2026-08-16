import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Leaf,
  ArrowLeft,
} from "lucide-react";

import heroImage from "../assets/hero-food.png";

const Register = () => {

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Food Donor",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      alert(
        "Please agree to the Terms & Privacy Policy."
      );
      return;
    }

    console.log(
      "Registration data:",
      formData
    );

    // Later connect this to your backend.
  };

  return (
    <div className="auth-page register-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="auth-form-section">

        <div className="auth-form-container register-container">

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
          <Link
            to="/"
            className="back-home"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="auth-heading register-heading">

            <h1>
              Create your account
            </h1>

            <p>
              Join FoodSaver AI and help turn
              surplus food into someone's next meal.
            </p>

          </div>


          {/* ================= REGISTER FORM ================= */}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {/* Full Name */}

            <div className="form-group">

              <label htmlFor="fullName">
                Full name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

            </div>


            {/* Email + Phone */}

            <div className="form-row">

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

                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Role */}

            <div className="form-group">

              <label htmlFor="role">
                I am signing up as
              </label>

              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Food Donor">
                  Food Donor
                </option>

                <option value="NGO">
                  NGO
                </option>

                <option value="Volunteer">
                  Volunteer
                </option>
              </select>

            </div>


            {/* Password + Confirm Password */}

            <div className="form-row">

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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
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


              <div className="form-group">

                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="password-input">

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Re-enter password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

            </div>


            {/* Terms */}

            <label className="terms-checkbox">

              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />

              <span>
                I agree to the{" "}
                <a href="#">
                  Terms & Privacy Policy
                </a>
              </span>

            </label>


            {/* Create Account */}

            <button
              type="submit"
              className="auth-submit"
            >
              Create Account
            </button>

          </form>


          <div className="auth-divider">
            <span>or</span>
          </div>


          <p className="auth-switch">

            Already have an account?{" "}

            <Link to="/login">
              Log in
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
            Turn surplus food into
            someone's next meal
          </h2>

          <p>
            Sign up to list surplus food, get
            AI-verified freshness checks, and get
            matched with the nearest NGO for pickup.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;