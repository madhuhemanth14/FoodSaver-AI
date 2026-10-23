import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./BackButton.css";

/**
 * Reusable, accessible BackButton
 * Uses browser history if available and in-app, otherwise falls back to `fallback` (or `to`).
 *
 * @param {string} [to] - Preferred fallback route if history is not available or inappropriate
 * @param {string} [fallback] - Alternative fallback route prop name
 * @param {string} [label="Back"] - Button text
 * @param {string} [className=""] - Additional CSS classes
 * @param {function} [onClick] - Optional custom click handler
 * @param {object} [style] - Optional inline style
 */
export default function BackButton({
  to,
  fallback,
  label = "Back",
  className = "",
  onClick,
  style,
}) {
  const navigate = useNavigate();

  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    const targetFallback = to || fallback;

    // If a specific fallback is provided and history doesn't have an in-app prior state,
    // or if the user refreshed / came from an external link
    if (targetFallback) {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate(targetFallback);
      }
      return;
    }

    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      type="button"
      className={`fs-back-btn ${className}`.trim()}
      onClick={handleBack}
      style={style}
      aria-label={label === "Back" ? "Go back to previous page" : label}
    >
      <ArrowLeft size={16} className="fs-back-btn__icon" aria-hidden="true" />
      <span className="fs-back-btn__label">{label}</span>
    </button>
  );
}
