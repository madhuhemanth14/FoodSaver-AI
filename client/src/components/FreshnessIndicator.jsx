import { getFreshnessMeta } from "../data/mockAnalysis";
import "../styles/food-analysis.css";

/**
 * Visual freshness score bar (0-100) with a state label.
 * @param {number} score
 * @param {"Fresh"|"Ripe"|"Moderate"|"Spoiled"} freshness
 */
const FreshnessIndicator = ({ score = 0, freshness = "Fresh" }) => {
  const meta = getFreshnessMeta(freshness);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="fa-freshness">
      <div className="fa-freshness__header">
        <span className="fa-freshness__title">Freshness</span>
        <span className="fa-freshness__score">{clamped} / 100</span>
      </div>
      <div className="fa-freshness__track" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="fa-freshness__fill"
          style={{ width: `${clamped}%`, backgroundColor: meta.color }}
        />
      </div>
      <span className="fa-freshness__badge" style={{ color: meta.color, backgroundColor: meta.bg }}>
        {meta.label}
      </span>
    </div>
  );
};

export default FreshnessIndicator;
