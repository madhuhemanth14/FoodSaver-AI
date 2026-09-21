import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";
import api from "../../services/api";
import "./Activity.css";

const TYPE_META = {
  donation: { icon: <Package size={19} />, className: "activity-donation", label: "Donation" },
  pickup: { icon: <Truck size={19} />, className: "activity-pickup", label: "Pickup" },
  ai: { icon: <Sparkles size={19} />, className: "activity-accepted", label: "AI Analysis" },
};

const STATUS_CLASS = {
  completed: "activity-complete",
  delivered: "activity-complete",
  accepted: "activity-accepted",
};

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function Activity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/activity")
      .then(({ data }) => {
        if (!cancelled) setActivities(data.activities || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Couldn't load your activity.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="activity-page">
      <div className="activity-page-inner">

        <div className="activity-topbar">
          <div>
            <h1>Recent Activity</h1>

            <p>
              Track your recent FoodSaver AI activity.
            </p>
          </div>

          <button
            type="button"
            className="activity-dashboard-button"
            onClick={() => navigate(`${base}/dashboard`)}
          >
            Dashboard
          </button>
        </div>

        {error && <p className="activity-page-error" role="alert">{error}</p>}

        {loading && <p className="activity-page-empty">Loading…</p>}

        {!loading && !error && activities.length === 0 && (
          <p className="activity-page-empty">
            Nothing here yet — your donations, pickups, and AI analyses will show up as you use FoodSaver AI.
          </p>
        )}

        <div className="activity-list-page">

          {!loading && activities.map((activity) => {
            const typeMeta = TYPE_META[activity.type] || TYPE_META.donation;
            const statusClass = STATUS_CLASS[activity.status] || typeMeta.className;
            return (
              <button
                type="button"
                key={activity._id}
                className={`activity-page-card ${statusClass}`}
                onClick={() => navigate(`${base}/dashboard`)}
              >

                <div className="activity-page-icon">
                  {typeMeta.icon}
                </div>

                <div className="activity-page-content">

                  <strong>
                    {activity.title}
                  </strong>

                  <span>
                    {activity.description}
                  </span>

                  <small>
                    {timeAgo(activity.createdAt)}
                  </small>

                </div>

                <div className="activity-page-type">
                  {typeMeta.label}
                </div>

              </button>
            );
          })}

        </div>

      </div>
    </div>
  );
}

export default Activity;
