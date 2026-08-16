import { useNavigate } from "react-router-dom";
import "./QuickActions.css";

const actions = [
  { label: "Donate Food", icon: "🍲", path: "/donate" },
  { label: "Analyze Food", icon: "🔍", path: "/analyze" },
  { label: "Find NGO", icon: "🏠", path: "/ngo" },
  { label: "Donation History", icon: "🕘", path: "/donations/history" },
];

/**
 * Grid of navigation shortcuts to the main app flows.
 * Assumes the corresponding routes already exist in the router.
 */
const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <h2 className="quick-actions__title">Quick Actions</h2>
      <div className="quick-actions__grid">
        {actions.map((action) => (
          <button
            key={action.path}
            type="button"
            className="quick-actions__button"
            onClick={() => navigate(action.path)}
          >
            <span className="quick-actions__icon">{action.icon}</span>
            <span className="quick-actions__label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
