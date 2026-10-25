import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Thermometer,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

export default function DonationGuidelinesModal({ isOpen, onClose }) {
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
        aria-labelledby="guidelines-modal-title"
        style={{ maxWidth: "680px" }}
      >
        <div className="terms-modal__header">
          <div>
            <h2 id="guidelines-modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={24} color="#16833d" />
              Food Donation Guidelines
            </h2>
            <p>Verified food safety standards and donation requirements for FoodSaver AI</p>
          </div>
          <button
            type="button"
            className="terms-modal__close"
            aria-label="Close guidelines"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="terms-modal__body" style={{ maxHeight: "68vh" }}>
          <section style={{ marginBottom: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16833d" }}>
              <CheckCircle2 size={18} color="#16833d" />
              1. Acceptable Food Items
            </h3>
            <ul style={{ paddingLeft: "20px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "5px" }}>
              <li><strong>Fresh Produce:</strong> Intact, unblemished fruits, vegetables, and greens.</li>
              <li><strong>Packaged & Dry Goods:</strong> Unopened rice, grains, pulses, flour, canned goods within expiry date.</li>
              <li><strong>Freshly Cooked Meals:</strong> Prepared in hygienic kitchens, donated within 4 hours of preparation.</li>
              <li><strong>Bakery Items:</strong> Breads, buns, bagels, and dry pastries in sealed packaging.</li>
              <li><strong>Beverages:</strong> Sealed, shelf-stable juices, water, and shelf-stable milk.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c62828" }}>
              <XCircle size={18} color="#c62828" />
              2. Items We Cannot Accept
            </h3>
            <ul style={{ paddingLeft: "20px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "5px" }}>
              <li>Food past its expiration or 'use by' date.</li>
              <li>Dented, leaking, bulging, or rusty cans and unsealed jars.</li>
              <li>Cooked food left at room temperature for over 4 hours.</li>
              <li>Leftovers from plates or half-eaten food from open buffet self-service lines.</li>
              <li>Food showing any signs of spoilage, mold, discoloration, or foul odors.</li>
            </ul>
          </section>

          <section style={{ marginBottom: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1b5e20" }}>
              <Thermometer size={18} color="#1b5e20" />
              3. Temperature & Storage Control
            </h3>
            <p>
              Keep hot cooked food above <strong>60°C (140°F)</strong> or cool it quickly and keep it chilled below <strong>5°C (41°F)</strong> until the NGO pickup volunteer arrives.
            </p>
          </section>

          <section style={{ marginBottom: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1b5e20" }}>
              <PackageCheck size={18} color="#1b5e20" />
              4. Packaging & Hygiene
            </h3>
            <p>
              Pack food in clean, food-grade containers, aluminum foil trays, or sealed containers. Clearly label items with the food name, preparation date, and any known allergens (nuts, dairy, gluten).
            </p>
          </section>

          <section>
            <h3 style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1b5e20" }}>
              <Sparkles size={18} color="#16833d" />
              5. AI Freshness & Verification
            </h3>
            <p>
              When uploading your donation, take a clear photo of the food. FoodSaver AI automatically evaluates visual quality, suggests safe shelf-life windows, and notifies local verified NGOs for prompt pickup.
            </p>
          </section>
        </div>

        <div className="terms-modal__footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <button type="button" className="btn-action-secondary" onClick={onClose} style={{ padding: "8px 18px" }}>
            Close
          </button>
          <Link
            to="/donor/donate"
            className="btn-action-primary"
            onClick={onClose}
            style={{ textDecoration: "none" }}
          >
            <span>Start Donation</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
