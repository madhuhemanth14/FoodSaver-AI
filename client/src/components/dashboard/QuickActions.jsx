import { useNavigate } from "react-router-dom";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="card quick-actions-card">

      <button onClick={() => navigate("/donations")}>
        <span>🍱</span>
        Donate Food
      </button>

      <button onClick={() => navigate("/ai-analysis")}>
        <span>🤖</span>
        Analyze Food
      </button>

      <button onClick={() => navigate("/ngo")}>
        <span>📍</span>
        Find NGO
      </button>

      <button onClick={() => navigate("/activity")}>
        <span>📜</span>
        History
      </button>

    </div>
  );
}

export default QuickActions;