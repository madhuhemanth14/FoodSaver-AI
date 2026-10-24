import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./DonationStatus";
import { useAuth } from "../context/AuthContext";
import { rolePrefix } from "../utils/roles";

/**
 * DonationSuccess
 * Presentational success screen shown after a donation is created.
 * Wrapped by pages/DonationSuccess.jsx, which supplies the created
 * donation record (via router state / storage) and navigation handlers.
 *
 * Props:
 *  - donation: { id, _id, foodName, foodItems, quantity, unit, quantityUnit, status }
 */
export default function DonationSuccess({ donation }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

  const donationId = donation?.id || donation?._id || "";
  const foodName =
    donation?.foodName ||
    (Array.isArray(donation?.foodItems) && donation.foodItems.length > 0
      ? donation.foodItems.join(", ")
      : donation?.foodItems || "Food Donation");
  const quantity = donation?.quantity ?? "—";
  const unit = donation?.unit || donation?.quantityUnit || "kg";
  const status = donation?.status || "Available";

  const handleViewDonation = () => {
    if (donationId) {
      navigate(`${base}/donations/${donationId}`);
    } else {
      navigate(`${base}/donations`);
    }
  };

  return (
    <div className="fs-success fs-fade-in">
      <div className="fs-success-icon-wrap" aria-hidden="true">
        <CheckCircle2 size={54} strokeWidth={2.2} className="fs-success-check-icon" />
      </div>
      <h1>Donation Created Successfully!</h1>
      <p className="fs-success-sub">Thank you for helping reduce food waste.</p>

      <div className="fs-card fs-success-card">
        {donationId && (
          <div className="fs-success-row">
            <span className="fs-success-row-label">Donation ID</span>
            <span className="fs-success-row-value">{donationId}</span>
          </div>
        )}
        <div className="fs-success-row">
          <span className="fs-success-row-label">Food</span>
          <span className="fs-success-row-value">{foodName}</span>
        </div>
        <div className="fs-success-row">
          <span className="fs-success-row-label">Quantity</span>
          <span className="fs-success-row-value">
            {quantity} {unit}
          </span>
        </div>
        <div className="fs-success-row">
          <span className="fs-success-row-label">Status</span>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="fs-success-actions">
        <button
          type="button"
          className="fs-btn fs-btn-primary fs-btn-block"
          onClick={handleViewDonation}
        >
          View Donation
        </button>
        <button
          type="button"
          className="fs-btn fs-btn-secondary fs-btn-block"
          onClick={() => navigate(`${base}/donate`)}
        >
          Donate More Food
        </button>
        <button
          type="button"
          className="fs-btn fs-btn-ghost fs-btn-block"
          onClick={() => navigate(`${base}/donations`)}
        >
          My Donations
        </button>
      </div>
    </div>
  );
}
