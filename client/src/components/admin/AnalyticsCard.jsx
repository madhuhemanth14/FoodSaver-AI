import "./AnalyticsCard.css";

export default function AnalyticsCard({ title, children, className = "" }) {
  return (
    <div className={`analytics-card ${className}`}>
      {title && <h3 className="analytics-card__title">{title}</h3>}
      <div className="analytics-card__body">
        {children}
      </div>
    </div>
  );
}
