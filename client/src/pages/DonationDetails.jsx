import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Building2, Truck } from "lucide-react";
import { StatusBadge, StatusTimeline } from "../components/DonationStatus";
import EmptyDonations from "../components/EmptyDonations";
import donationService from "../services/donationService";
import "../styles/donation-theme.css";
import "../styles/donation-components.css";
import "../styles/DonationDetails.css";

function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * DonationDetails (Member 3)
 * Full detail view for a single donation: food info, AI analysis,
 * status timeline, and placeholder NGO/pickup sections (real NGO
 * matching + pickup scheduling belong to other modules).
 */
export default function DonationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    donationService.getDonationById(id).then((data) => {
      if (cancelled) return;
      if (data) {
        setDonation(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="fs-module">
      <div className="fs-container">
        <button type="button" className="fs-details-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        {loading && (
          <>
            <div className="fs-skeleton fs-details-skeleton" style={{ width: "40%" }} />
            <div className="fs-skeleton fs-details-skeleton" style={{ width: "70%" }} />
            <div className="fs-skeleton" style={{ height: 280, marginTop: 16 }} />
          </>
        )}

        {!loading && notFound && (
          <EmptyDonations
            title="Donation not found"
            message="This donation may have been removed, or the link is incorrect."
            actionLabel="Back to My Donations"
            onAction={() => navigate("/donations")}
          />
        )}

        {!loading && donation && (
          <>
            <div className="fs-details-grid">
              <div className="fs-details-image">
                {donation.image ? <img src={donation.image} alt={donation.foodName} /> : null}
              </div>

              <div>
                <div className="fs-details-title-row">
                  <h1>{donation.foodName}</h1>
                  <StatusBadge status={donation.status} />
                </div>

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
                    <p className="fs-review-detail-label">Location</p>
                    <p className="fs-review-detail-value">{donation.location}</p>
                  </div>
                  <div>
                    <p className="fs-review-detail-label">Donation Date</p>
                    <p className="fs-review-detail-value">{formatDate(donation.createdAt)}</p>
                  </div>
                </div>

                {donation.description && (
                  <div>
                    <p className="fs-review-detail-label">Description</p>
                    <p className="fs-review-detail-value" style={{ fontWeight: 400 }}>
                      {donation.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="fs-card fs-details-section">
              <p className="fs-details-section-title">
                <Sparkles size={16} /> AI Analysis
              </p>
              <div className="fs-review-detail-grid">
                <div>
                  <p className="fs-review-detail-label">Freshness</p>
                  <p className="fs-review-detail-value">{donation.freshness || "—"}</p>
                </div>
                <div>
                  <p className="fs-review-detail-label">Confidence</p>
                  <p className="fs-review-detail-value">
                    {donation.confidence != null ? `${donation.confidence}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="fs-review-detail-label">Predicted Expiry</p>
                  <p className="fs-review-detail-value">{formatDate(donation.predictedExpiry)}</p>
                </div>
              </div>
            </div>

            <div className="fs-card fs-details-section">
              <p className="fs-details-section-title">Donation Status</p>
              <StatusTimeline status={donation.status} />
            </div>

            <div className="fs-card fs-details-section">
              <p className="fs-details-section-title">
                <Building2 size={16} /> NGO Information
              </p>
              {donation.ngo ? (
                <p className="fs-review-detail-value">{donation.ngo}</p>
              ) : (
                <p className="fs-review-detail-value" style={{ fontWeight: 400, color: "var(--fs-text-muted)" }}>
                  Not yet matched with an NGO.
                </p>
              )}
              <span className="fs-placeholder-note">
                NGO matching is handled by the NGO Finder module.
              </span>
            </div>

            <div className="fs-card fs-details-section">
              <p className="fs-details-section-title">
                <Truck size={16} /> Pickup Information
              </p>
              {donation.pickup ? (
                <p className="fs-review-detail-value">
                  {formatDate(donation.pickup.date)} · {donation.pickup.time}
                </p>
              ) : (
                <p className="fs-review-detail-value" style={{ fontWeight: 400, color: "var(--fs-text-muted)" }}>
                  Pickup has not been scheduled yet.
                </p>
              )}
              <span className="fs-placeholder-note">
                Pickup scheduling is handled by the Pickup Management module.
              </span>
            </div>

            <Link to="/donations" className="fs-btn fs-btn-secondary">
              ← Back to My Donations
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
