import "./StatCard.css";

/**
 * Statistic card used across the admin dashboard, analytics, and reports
 * pages. Distinct from components/dashboard/StatCard.jsx (that one is
 * icon/label/value/accent for the donor dashboard) — the admin pages
 * consistently call this one with title/value/icon/trend/description.
 * @param {{ title: string, value: string | number, icon?: string, trend?: string, description?: string }} props
 */
const StatCard = ({ title, value, icon = "◆", trend, description }) => {
  const trendDirection = trend?.startsWith("-") ? "down" : "up";

  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__body">
        <span className="admin-stat-card__value">{value}</span>
        <span className="admin-stat-card__title">{title}</span>
        {(trend || description) && (
          <span className="admin-stat-card__meta">
            {trend && (
              <span className={`admin-stat-card__trend admin-stat-card__trend--${trendDirection}`}>
                {trend}
              </span>
            )}
            {description && <span className="admin-stat-card__description">{description}</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
