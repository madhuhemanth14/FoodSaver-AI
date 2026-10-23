import React from "react";
import { Sparkles, Clock, Calendar, ShieldCheck, Utensils, AlertTriangle } from "lucide-react";
import { getFreshnessMeta } from "../data/mockAnalysis";
import "../styles/food-analysis.css";

const formatDate = (isoDateTime) => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatTime = (isoDateTime) => {
  if (!isoDateTime) return "—";
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const AIAnalysisCard = ({ result, preparationDate, preparationTime }) => {
  if (!result) return null;
  const meta = getFreshnessMeta(result.freshness);
  const confidencePercent = Math.round((result.confidence || 0) * (result.confidence <= 1 ? 100 : 1));

  return (
    <div className="fs-card fs-ai-analysis-card fs-fade-in">
      <div className="fs-ai-card-header">
        <div className="fs-ai-badge-pill">
          <Sparkles size={15} className="fs-ai-sparkle-icon" />
          <span>FoodSaver AI Analysis</span>
        </div>
        <span className="fs-ai-status-tag">
          <ShieldCheck size={14} /> Verified Quality
        </span>
      </div>

      <div className="fs-ai-metrics-grid">
        <div className="fs-ai-metric-box">
          <span className="fs-ai-metric-label">
            <Utensils size={13} /> Identified Food
          </span>
          <span className="fs-ai-metric-value">{result.foodType || "Food Item"}</span>
        </div>

        <div className="fs-ai-metric-box">
          <span className="fs-ai-metric-label">
            <ShieldCheck size={13} /> Freshness
          </span>
          <span className={`fs-freshness-chip fs-freshness-${(result.freshness || "fresh").toLowerCase().replace(/\s+/g, "-")}`}>
            {meta.label || result.freshness}
          </span>
        </div>

        <div className="fs-ai-metric-box">
          <span className="fs-ai-metric-label">Confidence</span>
          <div className="fs-ai-confidence-wrap">
            <div className="fs-ai-confidence-bar">
              <div
                className="fs-ai-confidence-fill"
                style={{ width: `${Math.min(100, Math.max(10, confidencePercent))}%` }}
              />
            </div>
            <span className="fs-ai-metric-value">{confidencePercent}%</span>
          </div>
        </div>

        <div className="fs-ai-metric-box">
          <span className="fs-ai-metric-label">
            <Clock size={13} /> Shelf Life
          </span>
          <span className="fs-ai-metric-value fs-highlight-green">
            {result.remainingHours != null ? `${result.remainingHours} hrs` : "Calculated"}
          </span>
        </div>
      </div>

      <div className="fs-ai-timeline-card">
        <div className="fs-ai-time-col">
          <div className="fs-ai-time-tag">
            <Calendar size={13} /> Prepared Timestamp
          </div>
          <div className="fs-ai-time-val">
            {preparationDate ? formatDate(`${preparationDate}T00:00:00`) : "—"} &bull; {preparationTime || "—"}
          </div>
        </div>

        <div className="fs-ai-timeline-arrow" aria-hidden="true">
          <div className="fs-ai-arrow-line" />
          <span className="fs-ai-arrow-badge">+{result.remainingHours ?? 0}h safe</span>
        </div>

        <div className="fs-ai-time-col fs-ai-time-col--expiry">
          <div className="fs-ai-time-tag">
            <Clock size={13} /> Estimated Expiry
          </div>
          <div className="fs-ai-time-val fs-ai-val--highlight">
            {formatDate(result.predictedExpiry)} &bull; {formatTime(result.predictedExpiry)}
          </div>
        </div>
      </div>

      {result.warnings && result.warnings.length > 0 && (
        <div className="fs-ai-warnings-banner">
          <AlertTriangle size={15} />
          <div>
            {result.warnings.map((w, idx) => (
              <p key={idx} className="fs-ai-warning-item">{w}</p>
            ))}
          </div>
        </div>
      )}

      <p className="fs-ai-generated-note">
        Shelf-life and expiration estimates are calculated automatically by FoodSaver AI using food category heuristics, visual analysis, and your preparation timestamp.
      </p>
    </div>
  );
};

export default AIAnalysisCard;
