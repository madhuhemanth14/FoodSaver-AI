import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Clock3,
  Settings,
  User,
} from "lucide-react";

import QuickActions from "../../components/dashboard/QuickActions";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";
import "./Dashboard.css";

const initialNotifications = [
  {
    id: 1,
    type: "pickup",
    title: "Pickup Scheduled",
    message:
      "Your food donation is scheduled for pickup today.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "donation",
    title: "Donation Accepted",
    message:
      "Your food donation has been accepted by the NGO.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "ai",
    title: "Food Analysis Completed",
    message:
      "Your AI food analysis has been completed successfully.",
    time: "2 hours ago",
    read: false,
  },
];

function getInitialNotifications() {
  try {
    const saved = localStorage.getItem(
      "foodsaver_notifications"
    );

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Unable to load notifications:",
      error
    );
  }

  return initialNotifications;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);
  const displayName = user?.name || "Guest";


  const [notifications] = useState(
    getInitialNotifications
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    localStorage.setItem(
      "foodsaver_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  return (
    <div className="dashboard-layout">

      {/* =========================
          SIDEBAR
      ========================== */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          🌿
        </div>

        {/* Dashboard */}
        <button
          type="button"
          className="sidebar-btn active"
          title="Dashboard"
          onClick={() => navigate(`${base}/dashboard`)}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="sidebar-btn"
          title="Notifications"
          onClick={() => navigate(`${base}/notifications`)}
        >
          <span className="sidebar-icon-wrapper">
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="sidebar-badge">
                {unreadCount}
              </span>
            )}
          </span>

          <span>Notifications</span>
        </button>

        {/* Activity */}
        <button
          type="button"
          className="sidebar-btn"
          title="Activity"
          onClick={() => navigate(`${base}/activity`)}
        >
          <Clock3 size={20} />
          <span>Activity</span>
        </button>

        {/* Profile */}
        <button
          type="button"
          className="sidebar-btn"
          title="Profile"
          onClick={() => navigate(`${base}/profile`)}
        >
          <User size={20} />
          <span>Profile</span>
        </button>

        {/* Settings — no dedicated settings page exists yet, so this
            opens Profile, consistent with the Quick Actions fallback. */}
        <button
          type="button"
          className="sidebar-btn"
          title="Settings"
          onClick={() => navigate(`${base}/profile`)}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>

      </aside>

      {/* =========================
          MAIN AREA
      ========================== */}
      <main className="dashboard-main">

        {/* =========================
            TOP HEADER
        ========================== */}
        <header className="top-header">

          <div className="header-brand">
            <span className="brand-leaf">
              🌿
            </span>

            <div>
              <h2>FoodSaver AI</h2>
              <span>User Dashboard</span>
            </div>
          </div>

          <div className="header-actions">

            {/* Notifications */}
            <button
              type="button"
              className="header-icon-btn"
              title="Notifications"
              onClick={() =>
                navigate(`${base}/notifications`)
              }
            >
              <Bell size={21} />

              {unreadCount > 0 && (
                <span className="header-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              type="button"
              className="header-profile-btn"
              title="Profile"
              onClick={() => navigate(`${base}/profile`)}
            >
              <User size={21} />
            </button>

          </div>

        </header>

        {/* =========================
            DASHBOARD CONTENT
        ========================== */}
        <div className="dashboard-content">

          {/* Welcome */}
          <section className="welcome-heading">

           <h1>
              Welcome back, {displayName} 👋
            </h1>

            <p>
              {user?.role === "ngo"
                ? "Here's what's happening with incoming donations and pickups today."
                : "Here's what's happening with your donations today."}
            </p>

          </section>

          {/* Profile summary */}
          <section className="profile-summary">

           <div className="large-avatar">
              {displayName
              .charAt(0)
              .toUpperCase()}
            </div>

            <div className="profile-summary-text">

              <h2>
                {displayName}
              </h2>

              <p>
                {user?.role === "ngo" ? "NGO" : user?.role === "admin" ? "Admin" : "Donor"} · FoodSaver AI
              </p>

              <span>
                Your donation activity and impact
              </span>

            </div>

          </section>

          {/* Analytics */}
          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon">
                📦
              </div>

              <div>
                <h2>25</h2>
                <p>Total Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🍽️
              </div>

              <div>
                <h2>1,240</h2>
                <p>Meals Served</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🟢
              </div>

              <div>
                <h2>6</h2>
                <p>Active Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🚚
              </div>

              <div>
                <h2>3</h2>
                <p>Pending Pickups</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🌍
              </div>

              <div>
                <h2>256</h2>
                <p>CO₂ Saved (kg)</p>
              </div>
            </div>

          </section>

          {/* Two-column content */}
          <section className="two-column">

            {/* Active Donations */}
            <div className="content-card">

              <div className="card-header">

                <h2>
                  Active Donations
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`${base}/activity`)
                  }
                >
                  View
                </button>

              </div>

              <div className="list-row">

                <div>
                  <strong>
                    Vegetable Biryani Trays
                  </strong>

                  <small>
                    12 trays
                  </small>
                </div>

                <span className="status active-status">
                  Active · 3h
                </span>

              </div>

              <div className="list-row">

                <div>
                  <strong>
                    Bakery Assortment
                  </strong>

                  <small>
                    Multiple items
                  </small>
                </div>

                <span className="status active-status">
                  Active · 6h
                </span>

              </div>

              <div className="list-row">

                <div>
                  <strong>
                    Packaged Fruit Bowls
                  </strong>

                  <small>
                    40 bowls
                  </small>
                </div>

                <span className="status expiring-status">
                  Expiring · 1h
                </span>

              </div>

            </div>

            {/* Upcoming Pickups */}
            <div className="content-card">

              <div className="card-header">

                <h2>
                  Upcoming Pickups
                </h2>

                <Clock3 size={18} />

              </div>

              <div className="pickup-row">

                <div>
                  <strong>
                    Sunrise Bakery
                  </strong>

                  <small>
                    Ramesh Kumar
                  </small>
                </div>

                <span>
                  Today, 5:30 PM
                </span>

              </div>

              <div className="pickup-row">

                <div>
                  <strong>
                    Green Table Kitchen
                  </strong>

                  <small>
                    Meena Iyer
                  </small>
                </div>

                <span>
                  Today, 7:00 PM
                </span>

              </div>

            </div>

          </section>

          {/* Recent Activities */}
          <section className="recent-card">

            <div className="recent-header">

              <div>

                <h2>
                  Recent Activities
                </h2>

                <p>
                  Your latest FoodSaver AI activity
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(`${base}/activity`)
                }
              >
                View all
              </button>

            </div>

            {/* Activity 1 */}
            <button
              type="button"
              className="activity-row"
              onClick={() =>
                navigate(`${base}/activity`)
              }
            >

              <div className="activity-left">

                <span className="activity-icon donation-icon">
                  📦
                </span>

                <div>
                  <strong>
                    Listed a new donation
                  </strong>

                  <p>
                    Vegetable Biryani Trays
                  </p>
                </div>

              </div>

              <span className="activity-type">
                Donation
              </span>

            </button>

            {/* Activity 2 */}
            <button
              type="button"
              className="activity-row"
              onClick={() =>
                navigate(`${base}/activity`)
              }
            >

              <div className="activity-left">

                <span className="activity-icon pickup-icon">
                  🚚
                </span>

                <div>
                  <strong>
                    Pickup Scheduled
                  </strong>

                  <p>
                    Sunrise Bakery · Today, 5:30 PM
                  </p>
                </div>

              </div>

              <span className="activity-type">
                Pickup
              </span>

            </button>

            {/* Activity 3 */}
            <button
              type="button"
              className="activity-row"
              onClick={() =>
                navigate(`${base}/activity`)
              }
            >

              <div className="activity-left">

                <span className="activity-icon complete-icon">
                  ✅
                </span>

                <div>
                  <strong>
                    Donation Completed
                  </strong>

                  <p>
                    Food successfully delivered
                  </p>
                </div>

              </div>

              <span className="activity-type">
                Completed
              </span>

            </button>

          </section>

          {/* Quick Actions */}
          <QuickActions />

        </div>

      </main>

    </div>
  );
}

export default Dashboard;