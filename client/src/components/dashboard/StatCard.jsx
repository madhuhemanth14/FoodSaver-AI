import { BarChart3 } from "lucide-react";
import "./StatCard.css";

/**
 * Reusable statistic card used across the dashboard.
 * @param {{ icon?: React.ReactNode, label: string, value: string | number, accent?: string }} props
 */
const StatCard = ({ icon = <BarChart3 size={20} />, label, value, accent = "green" }) => {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div className="stat-card__content">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  );
};

export default StatCard;
