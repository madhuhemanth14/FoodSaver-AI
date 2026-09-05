import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowLeft,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";
import "./Activity.css";

const getActivityIcon = (type) => {
  switch (type) {
    case "donation_created": return <Package size={19} />;
    case "pickup_scheduled": return <Truck size={19} />;
    case "donation_completed": return <CheckCircle2 size={19} />;
    default: return <Bell size={19} />;
  }
};

const getActivityClass = (type) => {
  switch (type) {
    case "donation_created": return "activity-donation";
    case "pickup_scheduled": return "activity-pickup";
    case "donation_completed": return "activity-complete";
    default: return "activity-donation";
  }
};

function Activity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    notificationService
      .getNotifications()
      .then((data) => {
        if (!cancelled) {
          setActivities(data.notifications || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load activity:", err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    if (diffH < 48) return "Yesterday";
    return d.toLocaleDateString();
  };

  return (
    <div className="activity-page">
      <div className="activity-container">
        <button className="activity-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="activity-title">Recent Activity</h1>
        <p className="activity-subtitle">Your latest FoodSaver AI activity</p>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
            Loading activity...
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
            <p style={{ fontSize: 36 }}>📋</p>
            <h3>No activity yet</h3>
            <p>Start donating food to see your activity here.</p>
          </div>
        )}

        <div className="activity-list">
          {activities.map((a) => (
            <div key={a._id} className={`activity-card ${getActivityClass(a.type)}`}>
              <div className="activity-icon">
                {getActivityIcon(a.type)}
              </div>
              <div className="activity-info">
                <strong>{a.title}</strong>
                <p>{a.message}</p>
              </div>
              <div className="activity-meta">
                <span className="activity-time">{formatTime(a.createdAt)}</span>
                <span className="activity-type-badge">{a.type?.replace(/_/g, " ") || "System"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Activity;