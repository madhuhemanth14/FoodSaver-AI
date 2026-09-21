import React from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "./DonationStatus";

/**
 * DonationSuccess
 * Presentational success screen shown after a donation is created.
 * Wrapped by pages/DonationSuccess.jsx, which supplies the created
 * donation record (via router state) and navigation handlers.
 *
 * Props:
 *  - donation: { id, foodName, quantity, unit, status }
 */
export default function DonationSuccess({ donation }) {
  const navigate = useNavigate();

  return (
    <div className="fs-success fs-fade-in">
      <div className="fs-success-emoji" aria-hidden="true">
        🎉
      </div>
      <h1>Donation Created Successfully!</h1>
      <p className="fs-success-sub">Thank you for helping reduce food waste.</p>

      <div className="fs-card fs-success-card">
        <div className="fs-success-row">
          <span className="fs-success-row-label">Donation ID</span>
          <span className="fs-success-row-value">{donation.id}</span>
        </div>
        <div className="fs-success-row">
          <span className="fs-success-row-label">Food</span>
          <span className="fs-success-row-value">{donation.foodName}</span>
        </div>
        <div className="fs-success-row">
          <span className="fs-success-row-label">Quantity</span>
          <span className="fs-success-row-value">
            {donation.quantity} {donation.unit}
          </span>
        </div>
        <div className="fs-success-row">
          <span className="fs-success-row-label">Status</span>
          <StatusBadge status={donation.status} />
        </div>
      </div>

      <div className="fs-success-actions">
        <button
          type="button"
          className="fs-btn fs-btn-primary fs-btn-block"
          onClick={() => navigate(`/donations/${donation.id}`)}
        >
          View Donation
        </button>
        <button
          type="button"
          className="fs-btn fs-btn-secondary fs-btn-block"
          onClick={() => navigate("/donate")}
        >
          Donate More Food
        </button>
        <button
          type="button"
          className="fs-btn fs-btn-ghost fs-btn-block"
          onClick={() => navigate("/donations")}
        >
          My Donations
        </button>
      </div>
    </div>
  );
}
