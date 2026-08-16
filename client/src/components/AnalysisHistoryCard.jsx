import { getFreshnessMeta } from "../data/mockAnalysis";
import "../styles/analysis-history.css";

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

/**
 * Row/card representing one past analysis in the history list.
 * @param {object} record
 * @param {(id: string) => void} onViewDetails
 */
const AnalysisHistoryCard = ({ record, onViewDetails }) => {
  const meta = getFreshnessMeta(record.freshness);

  return (
    <div className="ah-card">
      <img src={record.image} alt={record.foodType} className="ah-card__image" />
      <div className="ah-card__body">
        <div className="ah-card__top">
          <h3 className="ah-card__name">{record.foodType}</h3>
          <span className="ah-card__badge" style={{ color: meta.color, backgroundColor: meta.bg }}>
            {meta.label}
          </span>
        </div>
        <div className="ah-card__meta">
          <span>{Math.round(record.confidence * 100)}% confidence</span>
          <span aria-hidden="true">·</span>
          <span>
            {record.remainingDays === 0
              ? "Expires today"
              : `Expires in ${record.remainingDays} day${record.remainingDays === 1 ? "" : "s"}`}
          </span>
          <span aria-hidden="true">·</span>
          <span>Analyzed {formatDate(record.analyzedAt)}</span>
        </div>
      </div>
      <button
        type="button"
        className="fa-btn fa-btn--ghost ah-card__action"
        onClick={() => onViewDetails(record.id)}
      >
        View Details
      </button>
    </div>
  );
};

export default AnalysisHistoryCard;
