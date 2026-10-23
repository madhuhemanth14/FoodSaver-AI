import { useNavigate } from "react-router-dom";
import {
  HeartHandshake,
  Package,
  Building2,
  Truck,
  Bell,
  Settings,
  User,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";
import "./QuickActions.css";

/**
 * Grid of navigation shortcuts to the main app flows. Paths are built
 * relative to the current user's role prefix (/donor, /ngo, /admin) so
 * the same component works correctly under any role-scoped dashboard.
 */
const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);
  const isNgo = user?.role === "ngo";

  const actions = [
    ...(isNgo
      ? []
      : [{ label: "Donate Food", icon: <HeartHandshake size={20} />, path: `${base}/donate` }]),
    { label: "View Donations", icon: <Package size={20} />, path: `${base}/donations` },
    { label: "Explore NGOs", icon: <Building2 size={20} />, path: "/ngos" },
    { label: "Pickup Tracking", icon: <Truck size={20} />, path: `${base}/pickups` },
    { label: "Notifications", icon: <Bell size={20} />, path: `${base}/notifications` },
    { label: "Settings", icon: <Settings size={20} />, path: `${base}/settings` },
    { label: "Profile", icon: <User size={20} />, path: `${base}/profile` },
    { label: "AI Food Analysis", icon: <Sparkles size={20} />, path: "/analyze" },
  ];

  return (
    <div className="quick-actions">
      <h2 className="quick-actions__title">Quick Actions</h2>
      <div className="quick-actions__grid">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="quick-actions__button"
            onClick={() => navigate(action.path)}
          >
            <span className="quick-actions__icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{action.icon}</span>
            <span className="quick-actions__label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
