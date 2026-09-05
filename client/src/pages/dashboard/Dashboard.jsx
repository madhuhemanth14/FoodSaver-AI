import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Clock3,
  Settings,
  User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getDonorDashboard } from "../../services/dashboardService";
import QuickActions from "../../components/dashboard/QuickActions";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getDonorDashboard()
      .then((data) => {
        if (!cancelled) {
          setDashData(data);
          setUnreadCount(data.unreadNotifications || 0);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const stats = dashData?.stats || {};
  const recentDonations = dashData?.recentDonations || [];
  const recentActivity = dashData?.recentActivity || [];

  const userName = user?.name || "Guest";

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

        {/* Profile */}
        <button
          type="button"
          className="sidebar-btn"
          title="Profile"
          onClick={() => navigate("/profile")}
        >
          <User size={20} />
          <span>Profile</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          className="sidebar-btn"
          title="Settings"
          onClick={() => navigate("/profile")}
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

            {/* Profile */}
            <button
              type="button"
              className="header-profile-btn"
              title="Profile"
              onClick={() => navigate("/profile")}
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
              Welcome back, {userName} 👋
            </h1>

            <p>
              Here's what's happening with your
              donations today.
            </p>

          </section>

          {/* Profile summary */}
          <section className="profile-summary">

           <div className="large-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-summary-text">

              <h2>
                {userName}
              </h2>

              <p>
                {user?.role === "ngo" ? "NGO" : "Donor"} · FoodSaver AI
              </p>

              <span>
                Your donation activity and impact
              </span>

            </div>

          </section>

          {/* Analytics */}
          {loading ? (
            <section className="stats-grid">
              {[1,2,3,4,5].map(i => (
                <div className="stat-card" key={i} style={{opacity: 0.5}}>
                  <div className="stat-icon">⏳</div>
                  <div><h2>--</h2><p>Loading...</p></div>
                </div>
              ))}
            </section>
          ) : (
            <section className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon">
                  📦
                </div>
                <div>
                  <h2>{stats.totalDonations || 0}</h2>
                  <p>Total Donations</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  🍽️
                </div>
                <div>
                  <h2>{(stats.mealsProvided || 0).toLocaleString()}</h2>
                  <p>Meals Served</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  🟢
                </div>
                <div>
                  <h2>{stats.activeDonations || 0}</h2>
                  <p>Active Donations</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  ✅
                </div>
                <div>
                  <h2>{stats.completedDonations || 0}</h2>
                  <p>Completed</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  🌍
                </div>
                <div>
                  <h2>{stats.co2Saved || 0}</h2>
                  <p>CO₂ Saved (kg)</p>
                </div>
              </div>

            </section>
          )}

          {/* Two-column content */}
          <section className="two-column">

            {/* Recent Donations */}
            <div className="content-card">

              <div className="card-header">
                <h2>Recent Donations</h2>
                <button
                  type="button"
                  onClick={() => navigate("/donations")}
                >
                  View All
                </button>
              </div>

              {recentDonations.length === 0 && !loading && (
                <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>
                  <p>No donations yet. Start by donating food!</p>
                  <button
                    type="button"
                    className="status active-status"
                    style={{ marginTop: 10, cursor: "pointer" }}
                    onClick={() => navigate("/donate")}
                  >
                    Donate Now
                  </button>
                </div>
              )}

              {recentDonations.map((d) => (
                <div className="list-row" key={d._id}>
                  <div>
                    <strong>{d.foodName}</strong>
                    <small>{d.quantity} {d.quantityUnit || "kg"}</small>
                  </div>
                  <span className={`status ${
                    d.status === "Delivered" ? "active-status" :
                    d.status === "Cancelled" ? "expiring-status" :
                    "active-status"
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}

            </div>

            {/* Recent Activity */}
            <div className="content-card">

              <div className="card-header">
                <h2>Recent Activity</h2>
                <Clock3 size={18} />
              </div>

              {recentActivity.length === 0 && !loading && (
                <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>
                  No recent activity yet.
                </div>
              )}

              {recentActivity.map((a) => (
                <div className="pickup-row" key={a._id}>
                  <div>
                    <strong>{a.title}</strong>
                    <small>{a.message}</small>
                  </div>
                  <span style={{ fontSize: 12, color: "#999" }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}

            </div>

          </section>

          {/* Quick Actions */}
          <QuickActions />

        </div>

      </main>

    </div>
  );
}

export default Dashboard;