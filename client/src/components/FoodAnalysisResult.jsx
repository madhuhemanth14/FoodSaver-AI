import AIAnalysisCard from "./AIAnalysisCard";
import FreshnessIndicator from "./FreshnessIndicator";
import ExpiryPredictionCard from "./ExpiryPredictionCard";
import AnalysisStepper from "./AnalysisStepper";
import "../styles/food-analysis.css";

/**
 * Combines AIAnalysisCard, FreshnessIndicator, and ExpiryPredictionCard
 * into the main result view. Handles loading and error states.
 *
 * @param {"idle"|"loading"|"success"|"error"} status
 * @param {number} stepperStep - active step index while loading
 * @param {object|null} result
 * @param {string|null} errorMessage
 * @param {() => void} onRetry
 */
const FoodAnalysisResult = ({ status, stepperStep = 0, result, errorMessage, onRetry }) => {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="fa-result fa-result--loading">
        <AnalysisStepper currentStep={stepperStep} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="fa-result fa-result--error" role="alert">
        <p className="fa-result__error-title">Analysis failed</p>
        <p className="fa-result__error-message">
          {errorMessage || "Something went wrong while analyzing this image."}
        </p>
        {onRetry && (
          <button type="button" className="fa-btn fa-btn--ghost" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (status === "success" && result) {
    return (
      <div className="fa-result fa-result--success">
        <h2 className="fa-result__title">AI Analysis Result</h2>
        <div className="fa-result__grid">
          <AIAnalysisCard result={result} />
          <FreshnessIndicator score={result.freshnessScore} freshness={result.freshness} />
          <ExpiryPredictionCard
            predictedExpiry={result.predictedExpiry}
            remainingDays={result.remainingDays}
          />
        </div>
        <div className="fa-result__recommendation">
          <p className="fa-result__recommendation-label">Recommendation</p>
          <p className="fa-result__recommendation-text">“{result.recommendation}”</p>
        </div>
      </div>
    );
  }

  return null;
};

export default FoodAnalysisResult;
