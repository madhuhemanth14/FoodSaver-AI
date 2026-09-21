import React from "react";
import { Leaf } from "lucide-react";

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * DonationReview
 * Step 3 of the donation flow — full summary of the food details plus the
 * AI analysis result, with Edit and Confirm actions.
 *
 * Props:
 *  - donation: { foodName, category, quantity, unit, preparationDate,
 *                expiryDate, description, location, imagePreviewUrl,
 *                aiAnalysis }
 *  - onEdit: () => void
 *  - onConfirm: () => void
 *  - submitting: boolean
 */
export default function DonationReview({ donation, onEdit, onConfirm, submitting }) {
  const { aiAnalysis } = donation;

  return (
    <div className="fs-card fs-fade-in" style={{ padding: "24px" }}>
      <p className="fs-review-section-title">Donation Summary</p>

      <div className="fs-review-grid">
        <div className="fs-review-image">
          {donation.imagePreviewUrl ? (
            <img src={donation.imagePreviewUrl} alt={donation.foodName} />
          ) : null}
        </div>

        <div>
          <h2 className="fs-review-food-name">{donation.foodName}</h2>

          <div className="fs-review-detail-grid">
            <div>
              <p className="fs-review-detail-label">Quantity</p>
              <p className="fs-review-detail-value">
                {donation.quantity} {donation.unit}
              </p>
            </div>
            <div>
              <p className="fs-review-detail-label">Category</p>
              <p className="fs-review-detail-value">{donation.category}</p>
            </div>
            <div>
              <p className="fs-review-detail-label">Prepared</p>
              <p className="fs-review-detail-value">{formatDate(donation.preparationDate)}</p>
            </div>
            <div>
              <p className="fs-review-detail-label">Expiry</p>
              <p className="fs-review-detail-value">{formatDate(donation.expiryDate)}</p>
            </div>
            <div>
              <p className="fs-review-detail-label">Location</p>
              <p className="fs-review-detail-value">{donation.location}</p>
            </div>
          </div>

          {donation.description && (
            <div style={{ marginBottom: "8px" }}>
              <p className="fs-review-detail-label">Description</p>
              <p className="fs-review-detail-value" style={{ fontWeight: 400 }}>
                {donation.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <hr className="fs-review-divider" />

      <p className="fs-review-section-title">
        <Leaf size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        AI Analysis
      </p>

      <div className="fs-review-detail-grid">
        <div>
          <p className="fs-review-detail-label">AI Detected Food</p>
          <p className="fs-review-detail-value">{aiAnalysis?.foodType || "—"}</p>
        </div>
        <div>
          <p className="fs-review-detail-label">Freshness</p>
          <p className="fs-review-detail-value">{aiAnalysis?.freshness || "—"}</p>
        </div>
        <div>
          <p className="fs-review-detail-label">Confidence</p>
          <p className="fs-review-detail-value">
            {aiAnalysis?.confidence != null ? `${aiAnalysis.confidence}%` : "—"}
          </p>
        </div>
        <div>
          <p className="fs-review-detail-label">Predicted Expiry</p>
          <p className="fs-review-detail-value">{formatDate(aiAnalysis?.predictedExpiry)}</p>
        </div>
      </div>

      <div className="fs-review-actions">
        <button type="button" className="fs-btn fs-btn-secondary" onClick={onEdit} disabled={submitting}>
          Edit Details
        </button>
        <button type="button" className="fs-btn fs-btn-primary" onClick={onConfirm} disabled={submitting}>
          {submitting ? (
            <>
              <span className="fs-spinner" /> Confirming...
            </>
          ) : (
            "Confirm Donation"
          )}
        </button>
      </div>
    </div>
  );
}
