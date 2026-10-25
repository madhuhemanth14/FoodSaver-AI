import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";

export default function TrackDonationModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTrackingId("");
    setError("");

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = trackingId.trim();

    if (!cleanId) {
      setError("Please enter a Donation ID or Pickup ID to track.");
      return;
    }

    onClose();

    if (!user) {
      // Direct guest to login while preserving the tracking destination
      navigate(`/login`, {
        state: { returnTo: `/donor/donations/${cleanId}` },
      });
      return;
    }

    // If ID looks like a pickup ID or user requested pickup tracking
    if (cleanId.toLowerCase().startsWith("p-") || cleanId.toLowerCase().includes("pickup")) {
      navigate(`${base}/pickups/${cleanId}`);
    } else {
      navigate(`${base}/donations/${cleanId}`);
    }
  };

  const handleQuickNav = (path) => {
    onClose();
    if (!user) {
      navigate("/login", { state: { returnTo: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <div
      className="terms-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="terms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-modal-title"
        style={{ maxWidth: "620px" }}
      >
        <div className="terms-modal__header">
          <div>
            <h2 id="track-modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Compass size={22} color="#16833d" />
              Track Food Donation & Pickup
            </h2>
            <p>Real-time status monitoring for your surplus food sharing</p>
          </div>
          <button
            type="button"
            className="terms-modal__close"
            aria-label="Close track donation modal"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="terms-modal__body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Lookup Input Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="track-id-input" style={{ fontSize: "13px", fontWeight: "700", color: "#26352b" }}>
              Look up by Donation ID or Pickup ID
            </label>
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b8a78",
                  }}
                />
                <input
                  id="track-id-input"
                  type="text"
                  placeholder="e.g. 67b... or donation ID"
                  value={trackingId}
                  onChange={(e) => {
                    setTrackingId(e.target.value);
                    if (error) setError("");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    borderRadius: "10px",
                    border: error ? "1.5px solid #d32f2f" : "1.5px solid #d7e3da",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <span>Track Status</span>
                <ArrowRight size={14} />
              </button>
            </div>
            {error && (
              <span style={{ fontSize: "12px", color: "#d32f2f", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={13} /> {error}
              </span>
            )}
          </form>

          {/* Quick Access Buttons */}
          <div
            style={{
              background: "#f4f9f5",
              borderRadius: "12px",
              padding: "14px 16px",
              border: "1px solid #d8ebd9",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#2e7d32", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Quick Navigation
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => handleQuickNav(user?.role === "ngo" ? "/ngo/donations" : "/donor/donations")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#ffffff",
                  border: "1px solid #c9decb",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <Package size={18} color="#16833d" />
                <div>
                  <strong style={{ fontSize: "13px", color: "#26352b", display: "block" }}>All Donations</strong>
                  <span style={{ fontSize: "11px", color: "#6b8a78" }}>View donation history</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickNav(user?.role === "ngo" ? "/ngo/pickups" : "/donor/pickups")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#ffffff",
                  border: "1px solid #c9decb",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <Truck size={18} color="#16833d" />
                <div>
                  <strong style={{ fontSize: "13px", color: "#26352b", display: "block" }}>Pickup Tracking</strong>
                  <span style={{ fontSize: "11px", color: "#6b8a78" }}>Live pickup schedule</span>
                </div>
              </button>
            </div>
          </div>

          {/* Lifecycle explainer */}
          <div>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#26352b", margin: "4px 0 10px" }}>
              How FoodSaver AI Donation Tracking Works
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "#374151" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#e8f5e9", color: "#16833d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "11px", flexShrink: 0 }}>
                  1
                </span>
                <div>
                  <strong>AI Freshness & Safety Verification:</strong> Every donation photo and detail is assessed by AI for freshness and shelf life.
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "#374151" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#e8f5e9", color: "#16833d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "11px", flexShrink: 0 }}>
                  2
                </span>
                <div>
                  <strong>Verified NGO Matching:</strong> Nearby registered food banks and shelters are matched based on capacity and urgency.
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "#374151" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#e8f5e9", color: "#16833d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "11px", flexShrink: 0 }}>
                  3
                </span>
                <div>
                  <strong>Scheduled Pickup & In-Transit:</strong> The NGO schedules a pickup time and sends volunteers to collect the food.
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "#374151" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#e8f5e9", color: "#16833d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "11px", flexShrink: 0 }}>
                  4
                </span>
                <div>
                  <strong>Delivered & Distributed:</strong> Verified delivery to beneficiaries with carbon and meal impact credited to your profile.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
