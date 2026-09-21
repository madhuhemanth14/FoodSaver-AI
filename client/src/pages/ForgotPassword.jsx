import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowLeft, Mail } from "lucide-react";
import heroImage from "../assets/hero-food.png";
import { forgotPassword } from "../services/authService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (fieldError) setFieldError("");
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError("Email is required");
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setFieldError("Enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      // Backend always returns the same generic success message whether
      // or not this email belongs to an account — we never learn which,
      // and neither does anyone watching the network tab.
      const { message } = await forgotPassword(email.trim());
      setSubmitted(true);
      setSubmitError("");
      setFieldError("");
      // Keep the exact backend copy so the UI never invents its own
      // wording about account existence.
      setServerMessage(message);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
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
          <Link to="/login" className="back-home">
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="auth-heading">
            <h1>Forgot your password?</h1>
            <p>
              Enter the email address on your account and we'll send you a
              link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="auth-form">
              <p className="auth-success-banner">
                <Mail
                  size={16}
                  style={{ verticalAlign: "text-bottom", marginRight: 6 }}
                />
                {serverMessage ||
                  "If an account exists for this email, a password reset link has been sent."}
              </p>
              <p style={{ fontSize: 13, color: "#68716b" }}>
                Didn't get it? Check your spam folder, or{" "}
                <button
                  type="button"
                  className="forgot-password"
                  style={{ fontSize: 13, padding: 0 }}
                  onClick={() => {
                    setSubmitted(false);
                    setServerMessage("");
                  }}
                >
                  try a different email
                </button>
                .
              </p>
              <Link to="/login" className="auth-submit" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {submitError && (
                <p className="auth-error-banner">{submitError}</p>
              )}

              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
                {fieldError && (
                  <p
                    style={{
                      color: "#b91c1c",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {fieldError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Remembered your password? <Link to="/login">Log in</Link>
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
          <h2>We'll get you back in — securely</h2>
          <p>
            Your reset link is single-use and expires in about 15 minutes,
            so your account stays protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
