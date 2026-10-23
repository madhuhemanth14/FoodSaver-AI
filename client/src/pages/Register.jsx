import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Leaf,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import heroImage from "../assets/hero-food.png";
import {
  registerUser,
  sendRegistrationOtp,
  verifyRegistrationOtp,
} from "../services/authService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_SUCCESS_MESSAGE = "OTP sent successfully";
const RESEND_SUCCESS_MESSAGE = "New OTP sent successfully";
const RESEND_FAILED_MESSAGE = "Unable to resend OTP. Please try again.";
const SEND_FAILED_MESSAGE =
  "We couldn't send the verification email right now. Please try again in a few minutes.";

const Register = () => {
  const navigate = useNavigate();

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

    if (name === "password" || name === "confirmPassword") setPasswordError("");

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });

    // Changing the email invalidates any OTP/verification for the old one.
    if (name === "email") resetEmailVerification();
  };

  const [submitting, setSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // Email verification (happens BEFORE Create Account).
  //   idle -> otp-sent (OTP box visible) -> verified
  const [emailStage, setEmailStage] = useState("idle");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  // Shown under the password field when the backend rejects a reused password.
  const [passwordError, setPasswordError] = useState("");
  const [emailInfo, setEmailInfo] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // Synchronous in-flight guards: a fast double click cannot fire two requests
  // before React re-renders the disabled buttons.
  const sendInFlight = useRef(false);
  const verifyInFlight = useRef(false);
  const [resendIn, setResendIn] = useState(0);

  const resetEmailVerification = () => {
    setEmailStage("idle");
    setVerifiedEmail("");
    setVerificationToken("");
    setOtp("");
    setEmailError("");
    setEmailInfo("");
    setResendIn(0);
  };

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // "Verify" link and "Resend OTP": the backend generates + emails an OTP.
  const handleSendOtp = async () => {
    if (sendInFlight.current) return;
    const email = formData.email.trim().toLowerCase();
    // The OTP box is already showing => this click is "Resend OTP". It calls
    // the same backend endpoint, which generates and emails a brand-new OTP
    // and invalidates the previous one.
    const isResend = emailStage === "otp-sent";
    setEmailError("");
    setEmailInfo("");

    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    sendInFlight.current = true;
    setSendingOtp(true);
    try {
      // Send the OTP directly. The OTP itself verifies that the user controls
      // the mailbox; do not perform SMTP mailbox probing before sending.
      const result = await sendRegistrationOtp(email);
      // The OTP box appears ONLY when the backend explicitly confirms the
      // OTP email was accepted/sent — never because of the email's format.
      if (!result || result.success !== true) {
        throw Object.assign(new Error("OTP was not sent"), {
          response: { data: { code: "OTP_NOT_SENT", message: SEND_FAILED_MESSAGE } },
        });
      }
      // Development aid: what the server actually saw (SMTP reply, mailbox
      // check). Never contains the OTP.
      if (result.debug) console.info("[send-otp] server diagnostics:", result.debug);
      // Success is only reached after the backend confirmed the (new) OTP
      // email was accepted for sending, so the countdown restarts here only.
      setOtp("");
      setEmailStage("otp-sent");
      setEmailInfo(isResend ? RESEND_SUCCESS_MESSAGE : SEND_SUCCESS_MESSAGE);
      setResendIn(result.resendAvailableInSeconds || 60);
    } catch (err) {
      const data = err.response?.data;
      if (data?.retryAfterSeconds) setResendIn(data.retryAfterSeconds);
      // Development aid: the backend includes the real email-service error.
      if (data?.debug) console.warn("[send-otp] email service error:", data.debug);

      if (data?.code === "OTP_LOCKED") {
        const seconds = Number(data.retryAfterSeconds) || 7200;
        setEmailError(
          `Email verification is temporarily locked. Please try again in ${Math.ceil(seconds / 60)} minutes.`
        );
        setOtp("");
        setEmailStage("idle");
        return;
      }

      if (isResend) {
        // A failed resend never pretends success and never restarts the
        // countdown. The OTP box stays, and so does what the user typed: the
        // backend restores the previous OTP when the new one cannot be sent,
        // so it remains valid under its normal expiry rules.
        if (err.response?.status === 429 && data?.message) {
          setEmailError(data.message);
        } else {
          setEmailError(RESEND_FAILED_MESSAGE);
        }
        return;
      }

      if (!data || typeof data !== "object") {
        setEmailError("Unable to reach the server. Please try again.");
      } else if (err.response?.status === 409) {
        // This is an account-exists condition, not an SMTP failure.
        setEmailError(data.message || "An account with this email already exists. Please use a different email address.");
      } else {
        // Do not claim that an address does not exist. Only the OTP delivery
        // result can tell us whether our configured mail service accepted it.
        setEmailError(data.message || SEND_FAILED_MESSAGE);
      }
      // No OTP box (and no Verify OTP / Resend OTP) after a failed first
      // send: the page returns to the plain "Verify" state.
      setOtp("");
      setEmailStage("idle");
    } finally {
      sendInFlight.current = false;
      setSendingOtp(false);
    }
  };

  // "Verify OTP": only the backend can mark the email as verified.
  const handleVerifyOtp = async () => {
    if (verifyInFlight.current || sendInFlight.current) return;
    setEmailError("");
    setEmailInfo("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setEmailError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    const email = formData.email.trim().toLowerCase();
    verifyInFlight.current = true;
    setVerifying(true);
    try {
      const result = await verifyRegistrationOtp(email, otp.trim());
      if (!result.verificationToken) throw new Error("No verification token returned");
      setVerificationToken(result.verificationToken);
      setVerifiedEmail(email);
      setEmailStage("verified");
      setOtp("");
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === "OTP_LOCKED") {
        const seconds = Number(data.retryAfterSeconds) || 7200;
        setEmailError(
          `Email verification is temporarily locked. Please try again in ${Math.ceil(seconds / 60)} minutes.`
        );
        setOtp("");
        setEmailStage("idle");
      } else {
        setEmailError(
          data?.message || "Unable to verify the OTP. Please try again."
        );
      }
    } finally {
      verifyInFlight.current = false;
      setVerifying(false);
    }
  };

  // "Create Account": the backend re-checks the verification token.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      emailStage !== "verified" ||
      verifiedEmail !== formData.email.trim().toLowerCase()
    ) {
      setEmailError("Please verify your email before creating your account.");
      return;
    }

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

    if (formData.role === "Admin") {
      alert(
        "Admin accounts can't be created through public signup. Contact hello.foodsaverai@gmail.com to request admin access."
      );
      return;
    }

    setPasswordError("");
    setSubmitting(true);
    try {
      // Registering does not log the user in automatically — it sends
      // them to Login to sign in with the account they just created.
      // The backend sends the welcome + admin-notification emails.
      await registerUser({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
        verificationToken,
      });

      localStorage.setItem("userName", formData.fullName);
      localStorage.setItem("userEmail", formData.email);
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === "PASSWORD_REUSED") {
        // This email has used this password before (even on a deleted
        // account). Nothing was created and the email stays verified, so the
        // user just chooses another password on this same page.
        setPasswordError(
          data.message ||
            "You have used this password before. Please use another password."
        );
      } else if (data?.code === "EMAIL_NOT_VERIFIED") {
        // Verification expired or was rejected by the backend: verify again.
        resetEmailVerification();
        setEmailError(data.message);
      } else {
        alert(data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
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

                <div className="email-input-wrap">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  {emailStage === "idle" && (
                    <button
                      type="button"
                      className="email-verify-link"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                    >
                      {sendingOtp ? "Checking..." : "Verify"}
                    </button>
                  )}
                </div>

                {emailStage === "verified" ? (
                  <p className="email-verified-badge">
                    <CheckCircle2 size={16} /> Email Verified
                  </p>
                ) : (
                  <>
                    {emailStage === "otp-sent" && (
                      <div className="email-otp-section">
                        <input
                          id="emailOtp"
                          name="emailOtp"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, ""));
                            setEmailError("");
                          }}
                          placeholder="Enter 6-digit OTP"
                          autoComplete="one-time-code"
                          aria-label="6-digit email OTP"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="email-verify-btn"
                          onClick={handleVerifyOtp}
                          disabled={verifying || sendingOtp}
                        >
                          {verifying ? "Verifying..." : "Verify OTP"}
                        </button>
                        <button
                          type="button"
                          className="auth-inline-button email-resend-btn"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || verifying || resendIn > 0}
                        >
                          {sendingOtp
                            ? "Resending OTP..."
                            : resendIn > 0
                              ? `Resend OTP in ${resendIn}s`
                              : "Resend OTP"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {emailInfo && !emailError && (
                  <p className="email-verify-info">{emailInfo}</p>
                )}
                {emailError && <p className="auth-field-error">{emailError}</p>}

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

                <option value="Admin">
                  Admin
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

                {passwordError && (
                  <p className="auth-field-error" role="alert">{passwordError}</p>
                )}

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
                <button
                  type="button"
                  className="terms-link"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermsOpen(true); }}
                >
                  Terms & Privacy Policy
                </button>
              </span>

            </label>


            {/* Create Account */}

            <button
              type="submit"
              className="auth-submit"
              disabled={submitting || emailStage !== "verified"}
            >
              {submitting ? "Creating Account..." : "Create Account"}
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

      {termsOpen && (
        <div
          className="terms-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setTermsOpen(false);
          }}
        >
          <div
            className="terms-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
          >
            <div className="terms-modal__header">
              <div>
                <h2 id="terms-modal-title">Terms & Privacy Policy</h2>
                <p>FoodSaver AI account and platform guidelines</p>
              </div>
              <button
                type="button"
                className="terms-modal__close"
                aria-label="Close terms and privacy policy"
                onClick={() => setTermsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="terms-modal__body">
              <h3>1. Using FoodSaver AI</h3>
              <p>FoodSaver AI connects food donors with NGOs for food donation and pickup coordination. You agree to provide accurate account and donation information.</p>

              <h3>2. Food safety</h3>
              <p>Donors are responsible for providing safe, suitable food and accurate expiry or preparation information. AI analysis is an assistance feature and does not replace human food-safety judgment.</p>

              <h3>3. Donations and pickups</h3>
              <p>Donation details may be shared with relevant NGOs so they can accept and coordinate pickup. Pickup times depend on the participating users and NGOs.</p>

              <h3>4. Privacy</h3>
              <p>FoodSaver AI uses the information required to operate accounts, donations, notifications, AI analysis and pickup coordination. Account information should not be shared with other people.</p>

              <h3>5. Account responsibility</h3>
              <p>You are responsible for keeping your login credentials secure and for the activity performed through your account. Do not create misleading, abusive or fraudulent donation records.</p>

              <h3>6. Policy updates</h3>
              <p>These terms may be updated as FoodSaver AI features change. Continued use of the platform after an update means you acknowledge the revised policy.</p>
            </div>

            <div className="terms-modal__footer">
              <button type="button" className="auth-submit" onClick={() => setTermsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Register;