import { getFreshnessMeta } from "../data/mockAnalysis";
import "../styles/food-analysis.css";

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

/**
 * Compact summary card for a single analysis result.
 * @param {object} result - analysis record (foodType, confidence, freshness, ...)
 */
const AIAnalysisCard = ({ result }) => {
  if (!result) return null;
  const meta = getFreshnessMeta(result.freshness);

  return (
    <div className="fa-ai-card">
      <p className="fa-ai-card__eyebrow">AI Analysis</p>
      <h3 className="fa-ai-card__food">
        <span aria-hidden="true">{result.emoji || "🍽️"}</span> {result.foodType}
      </h3>

      <div className="fa-ai-card__grid">
        <div>
          <p className="fa-ai-card__label">Confidence</p>
          <p className="fa-ai-card__value">{Math.round(result.confidence * 100)}%</p>
        </div>
        <div>
          <p className="fa-ai-card__label">Freshness</p>
          <p className="fa-ai-card__value" style={{ color: meta.color }}>
            {meta.label}
          </p>
        </div>
        <div>
          <p className="fa-ai-card__label">Expiry</p>
          <p className="fa-ai-card__value">{formatDate(result.predictedExpiry)}</p>
        </div>
      </div>

      <p className="fa-ai-card__remaining">
        {result.remainingDays} {result.remainingDays === 1 ? "day" : "days"} remaining
      </p>
    </div>
  );
};

export default AIAnalysisCard;
