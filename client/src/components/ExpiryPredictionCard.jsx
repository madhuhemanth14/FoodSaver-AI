import "../styles/food-analysis.css";

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

/**
 * Displays the predicted expiry date and remaining shelf life.
 * This is a display-only component — the frontend does not compute
 * the prediction itself, it renders whatever the analysis service returns.
 *
 * @param {string} predictedExpiry - ISO date string
 * @param {number} remainingDays
 */
const ExpiryPredictionCard = ({ predictedExpiry, remainingDays }) => {
  const isUrgent = remainingDays <= 1;

  return (
    <div className="fa-expiry-card">
      <p className="fa-expiry-card__label">Predicted Expiry</p>
      <p className="fa-expiry-card__date">{formatDate(predictedExpiry)}</p>
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
