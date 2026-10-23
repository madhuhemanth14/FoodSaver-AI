import React from "react";
import { Sparkles, MapPin, Calendar, Layers, Scale, Edit3, CheckCircle2, ShieldCheck, FileText } from "lucide-react";

function formatDateTime(dateValue, timeValue) {
  if (!dateValue) return "—";
  const raw = timeValue ? `${dateValue}T${timeValue}:00` : dateValue;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return dateValue;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * DonationReview
 * Step 3 of the donation flow — full summary of the food details plus the
 * AI analysis result, with Edit and Confirm actions.
 *
 * Props:
 *  - donation: { foodName, category, quantity, unit, preparationDate,
 *                preparationTime, description, location, imagePreviewUrl,
 *                aiAnalysis }
 *  - onEdit: () => void
 *  - onConfirm: () => void
 *  - submitting: boolean
 */
export default function DonationReview({ donation, onEdit, onConfirm, submitting }) {
  const { aiAnalysis } = donation;

  return (
    <div className="fs-card fs-review-card fs-fade-in">
      <div className="fs-review-header">
        <div>
          <span className="fs-review-badge">Step 3 of 3 &bull; Final Verification</span>
          <h2 className="fs-review-title">Review Your Donation</h2>
          <p className="fs-review-subtitle">Please ensure all food, quantity, and pickup details are accurate before publishing.</p>
        </div>
      </div>

      <div className="fs-review-body">
        {/* Left column: food photo if present */}
        {donation.imagePreviewUrl && (
          <div className="fs-review-image-pane">
            <img src={donation.imagePreviewUrl} alt={donation.foodName} className="fs-review-photo" />
            <div className="fs-review-photo-caption">
              <ShieldCheck size={13} /> Attached Food Photo
            </div>
          </div>
        )}

        {/* Right column: detailed summary specs */}
        <div className="fs-review-details-pane">
          <div className="fs-review-food-hero">
            <h3 className="fs-review-food-name">{donation.foodName}</h3>
            <span className="fs-review-category-pill">
              <Layers size={13} /> {donation.category}
            </span>
          </div>

          <div className="fs-review-grid-cards">
            <div className="fs-review-stat-item">
              <div className="fs-review-stat-icon">
                <Scale size={16} />
              </div>
              <div className="fs-review-stat-info">
                <span className="fs-review-stat-label">Quantity</span>
                <span className="fs-review-stat-val">
                  {donation.quantity} {donation.unit}
                </span>
              </div>
            </div>

            <div className="fs-review-stat-item">
              <div className="fs-review-stat-icon">
                <Calendar size={16} />
              </div>
              <div className="fs-review-stat-info">
                <span className="fs-review-stat-label">Prepared At</span>
                <span className="fs-review-stat-val">
                  {formatDateTime(donation.preparationDate, donation.preparationTime)}
                </span>
              </div>
            </div>

            <div className="fs-review-stat-item">
              <div className="fs-review-stat-icon">
                <MapPin size={16} />
              </div>
              <div className="fs-review-stat-info">
                <span className="fs-review-stat-label">Pickup Location</span>
                <span className="fs-review-stat-val">{donation.location}</span>
              </div>
            </div>

            <div className="fs-review-stat-item fs-review-stat-item--ai">
              <div className="fs-review-stat-icon fs-ai-icon-bg">
                <Sparkles size={16} />
              </div>
              <div className="fs-review-stat-info">
                <span className="fs-review-stat-label">AI Estimated Expiry</span>
                <span className="fs-review-stat-val fs-highlight-expiry">
                  {formatDateTime(aiAnalysis?.predictedExpiry)}
                </span>
              </div>
            </div>
          </div>

          {donation.description && (
            <div className="fs-review-desc-card">
              <span className="fs-review-desc-label">
                <FileText size={13} /> Notes &amp; Dietary Information
              </span>
              <p className="fs-review-desc-text">{donation.description}</p>
            </div>
          )}

          {/* AI assessment chip */}
          {aiAnalysis && (
            <div className="fs-review-ai-bar">
              <div className="fs-review-ai-meta">
                <Sparkles size={14} className="fs-ai-sparkle-icon" />
                <span>
                  AI Quality: <strong>{aiAnalysis.freshness || "Fresh"}</strong> ({Math.round((aiAnalysis.confidence || 0) * (aiAnalysis.confidence <= 1 ? 100 : 1))}% confidence)
                </span>
              </div>
              <span className="fs-review-ai-tag">Verified by FoodSaver AI</span>
            </div>
          )}
        </div>
      </div>

      <div className="fs-review-footer">
        <button
          type="button"
          className="fs-btn fs-btn-secondary"
          onClick={onEdit}
          disabled={submitting}
        >
          <Edit3 size={15} /> Edit Details
        </button>

        <button
          type="button"
          className="fs-btn fs-btn-primary fs-btn-confirm"
          onClick={onConfirm}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="fs-spinner" /> Publishing Donation...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Confirm &amp; Submit Donation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
