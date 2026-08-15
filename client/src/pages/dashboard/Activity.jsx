import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";

import "./Activity.css";

const activities = [
  {
    icon: <Package size={19} />,
    title: "Listed a new donation",
    description: "Vegetable Biryani Trays",
    time: "Today, 10:30 AM",
    type: "Donation",
    className: "activity-donation",
  },
  {
    icon: <Truck size={19} />,
    title: "Pickup Scheduled",
    description: "Sunrise Bakery · 5:30 PM",
    time: "Today",
    type: "Pickup",
    className: "activity-pickup",
  },
  {
    icon: <CheckCircle2 size={19} />,
    title: "Donation Completed",
    description: "Food successfully delivered",
    time: "Yesterday, 4:20 PM",
    type: "Completed",
    className: "activity-complete",
  },
  {
    icon: <Package size={19} />,
    title: "Donation Accepted",
    description: "Your food was accepted by an NGO",
    time: "Yesterday, 1:30 PM",
    type: "Accepted",
    className: "activity-accepted",
  },
];

function Activity() {
  const navigate = useNavigate();

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
              key={activity.title}
              className={`activity-page-card ${activity.className}`}
              onClick={() => navigate("/dashboard")}
            >

              <div className="activity-page-icon">
                {activity.icon}
              </div>

              <div className="activity-page-content">

                <strong>
                  {activity.title}
                </strong>

                <span>
                  {activity.description}
                </span>

                <small>
                  {activity.time}
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