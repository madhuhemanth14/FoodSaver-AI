import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Sparkles,
  BookOpen,
  Truck,
  ArrowRight,
  X,
  Compass,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";

export default function ResourcesModal({ isOpen, onClose, onOpenGuidelines }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCardClick = (path) => {
    onClose();
    navigate(path);
  };

  const resources = [
    {
      title: "Verified NGO Directory",
      desc: "Browse certified food banks, orphanages, and community kitchens.",
      icon: Building2,
      path: "/ngos",
      badge: "Community",
    },
    {
      title: "Interactive Relief Map",
      desc: "Live geospatial map of nearby food rescue partners with operating hours.",
      icon: MapPin,
      path: "/map",
      badge: "Map",
    },
    {
      title: "AI Freshness Scanner",
      desc: "Test our visual AI model to analyze food quality and safe consumption windows.",
      icon: Sparkles,
      path: "/analyze",
      badge: "AI Powered",
    },
    {
      title: "Pickup & Logistics Portal",
      desc: "Manage scheduled collections, volunteer handoffs, and verification steps.",
      icon: Truck,
      path: user ? `${base}/pickups` : "/login",
      badge: "Logistics",
    },
  ];

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
        aria-labelledby="resources-modal-title"
        style={{ maxWidth: "680px" }}
      >
        <div className="terms-modal__header">
          <div>
            <h2 id="resources-modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Compass size={24} color="#16833d" />
              FoodSaver AI Resources
            </h2>
            <p>Helpful tools and directories for donors, NGOs, and food rescue teams</p>
          </div>
          <button
            type="button"
            className="terms-modal__close"
            aria-label="Close resources modal"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="terms-modal__body" style={{ maxHeight: "68vh" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            {resources.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  onClick={() => handleCardClick(item.path)}
                  style={{
                    border: "1px solid #e1e9e2",
                    borderRadius: "12px",
                    padding: "16px",
                    background: "#f9fbf9",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#16833d";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(22, 131, 61, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e1e9e2";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "#e8f5e9",
                          color: "#16833d",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "#edf7ed",
                          color: "#1b5e20",
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <strong style={{ display: "block", fontSize: "14px", color: "#17201b", marginBottom: "4px" }}>
                      {item.title}
                    </strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#617164", lineHeight: "1.4" }}>
                      {item.desc}
                    </p>
                  </div>
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#16833d" }}>
                    <span>Open resource</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              border: "1px dashed #2e7d32",
              borderRadius: "12px",
              padding: "14px 16px",
              background: "#f0f8f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BookOpen size={20} color="#16833d" />
              <div>
                <strong style={{ fontSize: "13px", color: "#1b5e20", display: "block" }}>
                  Food Safety & Donation Standards
                </strong>
                <span style={{ fontSize: "12px", color: "#4f6553" }}>
                  Review criteria for acceptable foods, packaging, and safe temperatures.
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-action-primary"
              onClick={() => {
                onClose();
                onOpenGuidelines?.();
              }}
              style={{ fontSize: "12px", padding: "6px 14px" }}
            >
              View Guidelines
            </button>
          </div>
        </div>

        <div className="terms-modal__footer" style={{ textAlign: "right" }}>
          <button type="button" className="btn-action-secondary" onClick={onClose} style={{ padding: "8px 18px" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
