import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FreshnessIndicator from "../components/FreshnessIndicator";
import { getAnalysisById } from "../services/aiAnalysisService";
import "../styles/analysis-details.css";

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

const AnalysisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    getAnalysisById(id)
      .then((data) => {
        if (isMounted) {
          setRecord(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="ad-page">
        <p className="ad-page__status">Loading analysis...</p>
      </div>
    );
  }

  if (status === "error" || !record) {
    return (
      <div className="ad-page">
        <div className="ad-empty">
          <p className="ad-empty__title">Analysis not found</p>
          <p className="ad-empty__hint">This record may have been removed.</p>
          <button type="button" className="fa-btn fa-btn--ghost" onClick={() => navigate("/analysis-history")}>
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-page">
      <button type="button" className="ad-back" onClick={() => navigate("/analysis-history")}>
        ← Back to History
      </button>

      <h1 className="ad-page__title">Food Analysis Details</h1>

      <div className="ad-card">
        <img src={record.image} alt={record.foodType} className="ad-card__image" />

        <div className="ad-card__body">
          <h2 className="ad-card__food">
            <span aria-hidden="true">{record.emoji || "🍽️"}</span> {record.foodType}
          </h2>

          <div className="ad-card__grid">
            <div className="ad-stat">
              <p className="ad-stat__label">AI Confidence</p>
              <p className="ad-stat__value">{Math.round(record.confidence * 100)}%</p>
            </div>
            <div className="ad-stat">
              <p className="ad-stat__label">Predicted Expiry</p>
              <p className="ad-stat__value">{formatDate(record.predictedExpiry)}</p>
            </div>
            <div className="ad-stat">
              <p className="ad-stat__label">Remaining Shelf Life</p>
              <p className="ad-stat__value">
                {record.remainingDays} {record.remainingDays === 1 ? "day" : "days"}
              </p>
            </div>
            <div className="ad-stat">
              <p className="ad-stat__label">Analysis Date</p>
              <p className="ad-stat__value">{formatDate(record.analyzedAt)}</p>
            </div>
          </div>

          <FreshnessIndicator score={record.freshnessScore} freshness={record.freshness} />

          <div className="ad-recommendation">
            <p className="ad-recommendation__label">AI Recommendation</p>
            <p className="ad-recommendation__text">“{record.recommendation}”</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetails;
