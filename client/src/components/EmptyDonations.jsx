import React from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake } from "lucide-react";

/**
 * EmptyDonations
 * Friendly empty state for the DonationHistory page — used both when the
 * user has no donations yet, and when filters return no matches.
 *
 * Props:
 *  - title: string (optional)
 *  - message: string (optional)
 *  - actionLabel: string (optional, defaults to "Donate Food")
 *  - onAction: () => void (optional; defaults to navigating to /donate)
 */
export default function EmptyDonations({
  title = "No donations yet",
  message = "Once you share food with the community, it will show up here.",
  actionLabel = "Donate Food",
  onAction,
}) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate("/donate");
    }
  };

  return (
    <div className="fs-card fs-empty">
      <div className="fs-empty-icon">
        <HeartHandshake size={32} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      <button type="button" className="fs-btn fs-btn-primary" onClick={handleAction}>
        {actionLabel}
      </button>
    </div>
  );
}
