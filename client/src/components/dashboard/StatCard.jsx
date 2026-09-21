import "./StatCard.css";

/**
 * Reusable statistic card used across the dashboard.
 * @param {{ icon?: string, label: string, value: string | number, accent?: string }} props
 */
const StatCard = ({ icon = "📊", label, value, accent = "green" }) => {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  );
};

export default StatCard;
