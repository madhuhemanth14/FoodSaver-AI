import "../styles/food-analysis.css";

/**
 * Primary action button for triggering food analysis.
 * Reuses the module's own button styling; swap for a shared <Button />
 * component if one exists in the project (e.g. import Button from
 * "../components/Button" and pass these same props through).
 *
 * @param {"idle"|"loading"|"complete"} status
 * @param {boolean} hasImage
 * @param {() => void} onClick
 */
const AnalyzeButton = ({ status = "idle", hasImage = false, onClick }) => {
  const isDisabled = !hasImage || status === "loading";

  const label =
    status === "loading" ? "Analyzing..." : status === "complete" ? "Analyze Again" : "Analyze Food";

  return (
    <button
      type="button"
      className="fa-btn fa-btn--primary fa-analyze-btn"
      disabled={isDisabled}
      onClick={onClick}
    >
      {status === "loading" && <span className="fa-analyze-btn__spinner" aria-hidden="true" />}
      {label}
    </button>
  );
};

export default AnalyzeButton;
