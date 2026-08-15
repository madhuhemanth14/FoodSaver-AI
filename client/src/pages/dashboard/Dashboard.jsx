import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Clock3,
  Settings,
  User,
} from "lucide-react";

import "./Dashboard.css";
import { getUnreadCount } from "../../services/notificationService";

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

  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
  totalDonations: 0,
  mealsServed: 0,
  activeDonations: 0,
  pendingPickups: 0,
  co2Saved: 0,
  });

  useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error(
        "Failed to fetch unread notification count:",
        error
      );
    }
  };

  fetchUnreadCount();
   }, []);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/dashboard/stats"
      );

      const data = await response.json();

      setStats(data);
    } catch (error) {
      console.error(
        "Failed to fetch dashboard stats:",
        error
      );
    }
  };

  fetchStats();
   }, []);

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
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="sidebar-btn"
          title="Notifications"
          onClick={() => navigate("/notifications")}
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
          onClick={() => navigate("/activity")}
        >
          <Clock3 size={20} />
          <span>Activity</span>
        </button>

        {/* Profile
            Waiting for authentication/profile teammate integration.
            Do not navigate yet. */}
        <button
          type="button"
          className="sidebar-btn"
          title="Profile"
        >
          <User size={20} />
          <span>Profile</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          className="sidebar-btn"
          title="Settings"
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
                navigate("/notifications")
              }
            >
              <Bell size={21} />

              {unreadCount > 0 && (
                <span className="header-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile
                Waiting for authentication/profile
                teammate integration. */}
            <button
              type="button"
              className="header-profile-btn"
              title="Profile"
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
              Welcome back, Sowmya 👋
            </h1>

            <p>
              Here's what's happening with your
              donations today.
            </p>

          </section>

          {/* Profile summary */}
          <section className="profile-summary">

            <div className="large-avatar">
              S
            </div>

            <div className="profile-summary-text">

              <h2>
                Sowmya Dasari
              </h2>

              <p>
                Donor · FoodSaver AI
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
                <h2>{stats.totalDonations}</h2>
                <p>Total Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🍽️
              </div>

              <div>
                <h2>{stats.mealsServed}</h2>
                <p>Meals Served</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🟢
              </div>

              <div>
                <h2>{stats.activeDonations}</h2>
                <p>Active Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🚚
              </div>

              <div>
                <h2>{stats.pendingPickups}</h2>
                <p>Pending Pickups</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🌍
              </div>

              <div>
                <h2>{stats.co2Saved}</h2>
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
                    navigate("/activity")
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
                  navigate("/activity")
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
                navigate("/activity")
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
                navigate("/activity")
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
                navigate("/activity")
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

        </div>

      </main>

    </div>
  );
}

export default Dashboard;