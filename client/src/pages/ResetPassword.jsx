import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Leaf, ArrowLeft, CheckCircle2 } from "lucide-react";
import heroImage from "../assets/hero-food.png";
import { resetPassword } from "../services/authService";

const MIN_PASSWORD_LENGTH = 6;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!token) {
      setSubmitError("This reset link is invalid or has expired.");
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Invalid or expired reset link. Please request a new one."
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
            <h1>{success ? "Password reset" : "Reset your password"}</h1>
            <p>
              {success
                ? "Your password has been changed successfully."
                : "Choose a new password for your FoodSaver AI account."}
            </p>
          </div>

          {success ? (
            <div className="auth-form">
              <p className="auth-success-banner">
                <CheckCircle2
                  size={16}
                  style={{ verticalAlign: "text-bottom", marginRight: 6 }}
                />
                Your password has been reset successfully. You can now log
                in with your new password.
              </p>
              <button
                type="button"
                className="auth-submit"
                onClick={() => navigate("/login", { replace: true })}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {submitError && (
                <p className="auth-error-banner">{submitError}</p>
              )}

              {/* New Password */}
              <div className="form-group">
                <label htmlFor="password">New password</label>
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <div className="password-input">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting}
              >
                {submitting ? "Resetting..." : "Reset Password"}
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
          <h2>Almost there</h2>
          <p>
            Set a new password to get back to tracking donations, pickups,
            and NGO matches.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
