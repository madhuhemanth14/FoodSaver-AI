import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ArrowLeft, CheckCircle2 } from "lucide-react";
import heroImage from "../assets/hero-food.png";
import { forgotPassword } from "../services/authService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setFieldError("");
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setFieldError("Email is required");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setFieldError("Enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const result = await forgotPassword(trimmed);
      localStorage.setItem("fs_reset_email", trimmed);
      setSent(true);
      setTimeout(
        () =>
          navigate("/reset-password", {
            state: { email: trimmed, resendIn: result?.resendAvailableInSeconds || 60 },
          }),
        700
      );
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "We could not send the OTP. Please try again."
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
            <div className="auth-logo-icon"><Leaf size={25} /></div>
            <span>FoodSaver <b>AI</b></span>
          </Link>

          <Link to="/login" className="back-home">
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="auth-heading">
            <h1>Forgot your password?</h1>
            <p>Enter the email address registered with FoodSaver AI. We will send a one-time OTP to that email.</p>
          </div>

          {sent ? (
            <div className="auth-form">
              <p className="auth-success-banner">
                <CheckCircle2 size={17} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />
                OTP sent successfully. Check your email. Opening the OTP verification page…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {submitError && <p className="auth-error-banner">{submitError}</p>}

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
                {fieldError && <p className="auth-field-error">{fieldError}</p>}
              </div>

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="forgot-password-help">
                If the email is not registered, the page will tell you to enter a correct email address.
              </p>
            </form>
          )}

          <p className="auth-switch">Remembered your password? <Link to="/login">Log in</Link></p>
        </div>
      </div>

      <div className="auth-visual-section">
        <div className="auth-visual-content">
          <img src={heroImage} alt="FoodSaver AI food donation" className="auth-food-image" />
          <h2>Secure password recovery</h2>
          <p>Your OTP is time-limited and can be used only once to create a new password.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
