import React, { useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

export default function TermsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        aria-labelledby="terms-modal-title"
      >
        <div className="terms-modal__header">
          <div>
            <h2 id="terms-modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={22} color="#16833d" />
              Terms & Privacy Policy
            </h2>
            <p>FoodSaver AI account and platform guidelines</p>
          </div>
          <button
            type="button"
            className="terms-modal__close"
            aria-label="Close terms and privacy policy"
            onClick={onClose}
          >
            <X size={18} />
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

        <div className="terms-modal__footer" style={{ textAlign: "right" }}>
          <button type="button" className="btn-action-primary" onClick={onClose} style={{ padding: "8px 24px" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
