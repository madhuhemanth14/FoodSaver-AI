import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock } from "lucide-react";
import { StatusBadge } from "./DonationStatus";

function formatShortDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * FoodCard
 * Summary card for a single donation, used in the DonationHistory grid.
 *
 * Props:
 *  - donation: object
 *  - onViewDetails: (id) => void (optional; defaults to navigating to /donations/:id)
 */
export default function FoodCard({ donation, onViewDetails }) {
  const navigate = useNavigate();

  const handleView = () => {
    if (onViewDetails) {
      onViewDetails(donation.id);
    } else {
      navigate(`/donations/${donation.id}`);
    }
  };

  return (
    <article className="fs-card fs-food-card">
      <div className="fs-food-card-image">
        {donation.image ? (
          <img src={donation.image} alt={donation.foodName} loading="lazy" />
        ) : null}
      </div>
      <div className="fs-food-card-body">
        <div className="fs-food-card-top">
          <div>
            <h3 className="fs-food-card-name">{donation.foodName}</h3>
            <p className="fs-food-card-qty">
              {donation.quantity} {donation.unit}
            </p>
          </div>
          <StatusBadge status={donation.status} />
        </div>
        <div className="fs-food-card-meta">
          <span>
            <CalendarDays size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Donated {formatShortDate(donation.createdAt)}
          </span>
          <span>
            <Clock size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            Expiry {formatShortDate(donation.expiryDate)}
          </span>
        </div>
      </div>
      <div className="fs-food-card-footer">
        <button type="button" className="fs-btn fs-btn-secondary fs-btn-block" onClick={handleView}>
          View Details
        </button>
      </div>
    </article>
  );
}
