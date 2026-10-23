import "../styles/food-analysis.css";

const formatDateTime = (isoDateTime) => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Displays the AI-predicted expiry date and time plus remaining shelf life.
 * This is a display-only component — the frontend does not compute
 * the prediction itself, it renders whatever the analysis service returns.
 *
 * @param {string} predictedExpiry - ISO date-time string
 * @param {number} remainingDays
 */
const ExpiryPredictionCard = ({ predictedExpiry, remainingDays }) => {
  const isUrgent = remainingDays <= 1;

  return (
    <div className="fa-expiry-card">
      <p className="fa-expiry-card__label">Predicted Expiry</p>
      <p className="fa-expiry-card__date">{formatDateTime(predictedExpiry)}</p>
      <p className={`fa-expiry-card__remaining ${isUrgent ? "is-urgent" : ""}`}>
        {remainingDays === 0
          ? "Expires today"
          : remainingDays === 1
          ? "1 day remaining"
          : `${remainingDays} days remaining`}
      </p>
      <p className="fa-expiry-card__note">
        Based on the detected food type and freshness condition.
      </p>
    </div>
  );
};

export default ExpiryPredictionCard;
