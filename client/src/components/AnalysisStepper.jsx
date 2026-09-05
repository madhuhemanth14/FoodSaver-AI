import "../styles/food-analysis.css";

const STEPS = [
  "Upload Image",
  "Processing Image",
  "Detecting Food",
  "Checking Freshness",
  "Predicting Expiry",
  "Analysis Complete",
];

/**
 * Visual progress stepper for the mock AI analysis pipeline.
 * @param {number} currentStep - 0-based index of the active step
 */
const AnalysisStepper = ({ currentStep = 0 }) => {
  return (
    <ol className="fa-stepper" aria-label="AI analysis progress">
      {STEPS.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li
            key={step}
            className={`fa-stepper__item ${
              isComplete ? "is-complete" : ""
            } ${isActive ? "is-active" : ""}`}
          >
            <span className="fa-stepper__marker" aria-hidden="true">
              {isComplete ? "✓" : isActive ? "●" : "○"}
            </span>
            <span className="fa-stepper__label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
};

export default AnalysisStepper;
