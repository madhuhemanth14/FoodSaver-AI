import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Leaf, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import heroImage from "../assets/hero-food.png";
import { forgotPassword, resetPassword, validateResetToken, verifyResetOtp } from "../services/authService";

const MIN_PASSWORD_LENGTH = 6;
const RESET_TOKEN_KEY = "fs_reset_token";
const RESET_EMAIL_KEY = "fs_reset_email";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || sessionStorage.getItem(RESET_EMAIL_KEY) || localStorage.getItem(RESET_EMAIL_KEY) || "";

  // The password form is NEVER shown because of client-side state alone.
  // If a reset token is stored, the page first asks the backend whether it
  // is genuine and unexpired ("checking"); otherwise the user starts at OTP.
  const [step, setStep] = useState(sessionStorage.getItem(RESET_TOKEN_KEY) ? "checking" : "otp");
  const [email] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState(() => sessionStorage.getItem(RESET_TOKEN_KEY) || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendIn, setResendIn] = useState(Number(location.state?.resendIn) || 0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (step !== "checking") return undefined;
    let cancelled = false;
    const token = sessionStorage.getItem(RESET_TOKEN_KEY);
    validateResetToken(token)
      .then(() => {
        if (cancelled) return;
        setResetToken(token);
        setStep("password");
      })
      .catch(() => {
        if (cancelled) return;
        sessionStorage.removeItem(RESET_TOKEN_KEY);
        setResetToken("");
        setStep("otp");
        setSubmitError("Your password reset session has expired. Please verify a new OTP.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    sessionStorage.setItem(RESET_EMAIL_KEY, email);
  }, [email, navigate]);

  const clearMessages = (field = null) => {
    setSubmitError("");
    if (field) setErrors((prev) => ({ ...prev, [field]: "" }));
    else setErrors({});
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({ otp: "Enter the 6-digit OTP sent to your email" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyResetOtp(email.trim(), otp.trim());
      const token = result.resetToken;
      if (!token) throw new Error("No reset token was returned");

      sessionStorage.setItem(RESET_TOKEN_KEY, token);
      sessionStorage.setItem(RESET_EMAIL_KEY, email.trim());
      setResetToken(token);
      setOtp("");
      // The token above was issued by the backend only after it verified
      // the OTP, so it is safe to move on to password creation.
      setStep("password");
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const status = err.response?.status;
      setSubmitError(
        serverMessage ||
          (status ? `Unable to verify the OTP (server error ${status}). Please try again.` :
            "Unable to verify the OTP because the server could not be reached. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    const next = {};
    if (!password) next.password = "New password is required";
    else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (!confirmPassword) next.confirmPassword = "Please confirm your new password";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    const token = resetToken || sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!token) {
      setSubmitError("Your password reset session has expired. Please request a new OTP.");
      setStep("otp");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      sessionStorage.removeItem(RESET_EMAIL_KEY);
      localStorage.removeItem(RESET_EMAIL_KEY);
      setSuccess(true);
    } catch (err) {
      const data = err?.response?.data;

      // A reused password is a normal, retryable mistake: keep the reset
      // token and stay on "Create New Password" so another password can be
      // entered. (The backend leaves the reset session valid in this case.)
      if (data?.code === "PASSWORD_REUSED") {
        setSubmitError(
          data.message ||
            "You have used this password already. Please use a new password."
        );
        return;
      }

      if (err.response?.status === 401) {
        // Backend says the reset session is gone/expired: start over at OTP.
        sessionStorage.removeItem(RESET_TOKEN_KEY);
        setResetToken("");
        setStep("otp");
      }
      setSubmitError(
        err.response?.data?.message ||
          "Unable to update the password. Please request a new OTP and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const requestNewOtp = async () => {
    if (!email || resending || resendIn > 0) return;

    setSubmitError("");
    setResendMessage("");
    setErrors({});
    setResending(true);

    try {
      const result = await forgotPassword(email.trim().toLowerCase());
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      sessionStorage.setItem(RESET_EMAIL_KEY, email.trim().toLowerCase());
      setResetToken("");
      setOtp("");
      setStep("otp");
      setResendIn(result.resendAvailableInSeconds || 60);
      setResendMessage("A new OTP has been sent to your email.");
    } catch (err) {
      const data = err.response?.data;
      if (data?.retryAfterSeconds) setResendIn(data.retryAfterSeconds);
      setSubmitError(data?.message || "Unable to resend the OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page reset-password-page">
      <div className="auth-form-section">
        <div className="auth-form-container">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><Leaf size={25} /></div>
            <span>FoodSaver <b>AI</b></span>
          </Link>

          <Link to="/login" className="back-home"><ArrowLeft size={16} /> Back to Login</Link>

          <div className="auth-heading">
            <h1>
              {success ? "Password updated" : step === "password" ? "Create a new password" : step === "checking" ? "Checking your reset session" : "Verify your OTP"}
            </h1>
            <p>
              {success
                ? "Your password has been changed successfully."
                : step === "password"
                  ? "Your OTP has been verified. Now create a new password for your account."
                  : step === "checking"
                    ? "Please wait a moment."
                    : `Enter the 6-digit OTP sent to ${email}.`}
            </p>
          </div>

          {success ? (
            <div className="auth-form">
              <p className="auth-success-banner">
                <CheckCircle2 size={17} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <button type="button" className="auth-submit" onClick={() => navigate("/login", { replace: true })}>
                Go to Login
              </button>
            </div>
          ) : step === "checking" ? (
            <div className="auth-form" />
          ) : step === "otp" ? (
            <form onSubmit={handleOtpSubmit} className="auth-form" noValidate>
              {submitError && <p className="auth-error-banner">{submitError}</p>}
              {resendMessage && <p className="auth-success-banner">{resendMessage}</p>}

              <div className="form-group">
                <label htmlFor="otp">6-digit OTP</label>
                <input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); clearMessages("otp"); }}
                  placeholder="Enter OTP"
                  autoComplete="one-time-code"
                  autoFocus
                />
                {errors.otp && <p className="auth-field-error">{errors.otp}</p>}
              </div>

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? "Verifying OTP..." : "Verify OTP"}
              </button>

              <button type="button" className="auth-secondary-button" onClick={requestNewOtp} disabled={submitting || resending || resendIn > 0}>
                {resending ? "Resending OTP..." : resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="auth-form" noValidate>
              {submitError && <p className="auth-error-banner">{submitError}</p>}

              <div className="auth-success-banner" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={18} />
                OTP verified successfully. Create your new password below.
              </div>

              <div className="form-group">
                <label htmlFor="password">New password</label>
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearMessages("password"); }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="auth-field-error">{errors.password}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm new password</label>
                <div className="password-input">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearMessages("confirmPassword"); }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((v) => !v)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="auth-field-error">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? "Updating Password..." : "Create New Password"}
              </button>
            </form>
          )}

          {!success && step === "otp" && (
            <p className="auth-switch">Entered the wrong email? <Link to="/forgot-password">Start again</Link></p>
          )}
          {!success && step === "password" && (
            <p className="auth-switch">Need a new OTP? <button type="button" className="auth-inline-button" onClick={requestNewOtp} disabled={resendIn > 0}>{resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}</button></p>
          )}
        </div>
      </div>

      <div className="auth-visual-section">
        <div className="auth-visual-content">
          <img src={heroImage} alt="FoodSaver AI food donation" className="auth-food-image" />
          <h2>{step === "otp" ? "One-time verification" : "Create a secure password"}</h2>
          <p>{step === "otp" ? "Verify the OTP from your email before creating a new password." : "Choose a new password to secure your FoodSaver AI account."}</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
