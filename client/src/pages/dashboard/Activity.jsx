import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";

import "./Activity.css";

function Activity() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  useEffect(() => {
  const fetchActivities = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/activity"
      );

      const data = await response.json();

      setActivities(data.activities || []);
    } catch (error) {
      console.error(
        "Failed to fetch activities:",
        error
      );
    }
  };

  fetchActivities();
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
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>

        <div className="activity-list-page">

          {activities.map((activity) => (
            <button
              type="button"
              key={activity._id}
              className="activity-page-card"
              onClick={() => navigate("/dashboard")}
            >

              <div className="activity-page-icon">
                📦
              </div>

              <div className="activity-page-content">

                <strong>
                  {activity.title}
                </strong>

                <span>
                  {activity.description}
                </span>
                <small>
                  {new Date(activity.createdAt).toLocaleString()}
                </small>

              </div>

              <div className="activity-page-type">
                {activity.type}
              </div>

            </button>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Activity;