import "./DonationSummary.css";

/**
 * Small widget summarizing this month's donation performance.
 * @param {{ monthlyDonations?: number, foodSavedKg?: number, successRate?: number }} props
 */
const DonationSummary = ({
  monthlyDonations = 12,
  foodSavedKg = 45,
  successRate = 92,
}) => {
  return (
    <div className="donation-summary">
      <h2 className="donation-summary__title">Donation Summary</h2>
      <div className="donation-summary__rows">
        <div className="donation-summary__row">
          <span className="donation-summary__label">This Month Donations</span>
          <span className="donation-summary__value">{monthlyDonations}</span>
        </div>
        <div className="donation-summary__row">
          <span className="donation-summary__label">Food Saved</span>
          <span className="donation-summary__value">{foodSavedKg} kg</span>
        </div>
        <div className="donation-summary__row">
          <span className="donation-summary__label">Success Rate</span>
          <span className="donation-summary__value">{successRate}%</span>
        </div>
      </div>
      <div className="donation-summary__bar">
        <div
          className="donation-summary__bar-fill"
          style={{ width: `${successRate}%` }}
        />
      </div>
    </div>
  );
};

export default DonationSummary;
