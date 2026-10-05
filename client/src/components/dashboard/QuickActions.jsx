import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";
import "./QuickActions.css";

/**
 * Grid of navigation shortcuts to the main app flows. Paths are built
 * relative to the current user's role prefix (/donor, /ngo, /admin) so
 * the same component works correctly under any role-scoped dashboard.
 *
 * "Donate Food" only exists as a route for donors (/donor/donate — see
 * App.jsx). NGOs don't donate food to themselves, so that action is
 * hidden for the "ngo" role instead of linking to a route
 * (`/ngo/donate`) that was never registered and silently 404'd back to
 * Home.
 */
const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);
  const isNgo = user?.role === "ngo";

  const actions = [
    ...(isNgo
      ? []
      : [{ label: "Donate Food", icon: "🍲", path: `${base}/donate` }]),
    { label: "View Donations", icon: "📦", path: `${base}/donations` },
    { label: "Explore NGOs", icon: "🏠", path: "/ngos" },
    { label: "Pickup Tracking", icon: "🚚", path: `${base}/pickups` },
    { label: "Notifications", icon: "🔔", path: `${base}/notifications` },
    { label: "Settings", icon: "⚙️", path: `${base}/profile` },
    { label: "Profile", icon: "👤", path: `${base}/profile` },
    { label: "AI Food Analysis", icon: "🧠", path: "/analyze" },
  ];

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
