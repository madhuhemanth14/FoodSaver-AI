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
import { getDashboardStats, getDashboardOverview } from "../../services/dashboardService";
import { getUnreadCount } from "../../services/notificationService";
import "./Dashboard.css";

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatPickupDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const dateLabel = isToday
    ? "Today"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return dateLabel;
}

const ACTIVITY_ICONS = {
  donation: { icon: "📦", className: "donation-icon" },
  pickup: { icon: "🚚", className: "pickup-icon" },
  ai: { icon: "🧠", className: "complete-icon" },
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);
  const displayName = user?.name || "Guest";

  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [statsData, overviewData, unread] = await Promise.all([
          getDashboardStats(),
          getDashboardOverview(),
          getUnreadCount().catch(() => 0),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setOverview(overviewData);
        setUnreadCount(unread);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Couldn't load your dashboard. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeDonations = overview?.activeDonations || [];
  const upcomingPickups = overview?.upcomingPickups || [];
  const recentActivity = overview?.recentActivity || [];

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

          {error && (
            <section className="dashboard-error" role="alert">
              <p>{error}</p>
            </section>
          )}

          {/* Analytics */}
          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon">
                🟢
              </div>

              <div>
                <h2>{loading ? "—" : stats?.activeDonations ?? 0}</h2>
                <p>Active Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🚚
              </div>

              <div>
                <h2>{loading ? "—" : stats?.upcomingPickups ?? 0}</h2>
                <p>Upcoming Pickups</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                ✅
              </div>

              <div>
                <h2>{loading ? "—" : stats?.completedDonations ?? 0}</h2>
                <p>Completed Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                🌍
              </div>

              <div>
                <h2>{loading ? "—" : stats?.foodSaved ?? 0}</h2>
                <p>Food Saved (kg)</p>
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
                    navigate(`${base}/donations`)
                  }
                >
                  View
                </button>

              </div>

              {loading && <p className="dashboard-empty">Loading…</p>}

              {!loading && activeDonations.length === 0 && (
                <p className="dashboard-empty">
                  No active donations yet. <button type="button" onClick={() => navigate(`${base}/donate`)}>Donate food</button>
                </p>
              )}

              {!loading && activeDonations.map((donation) => (
                <div className="list-row" key={donation._id}>
                  <div>
                    <strong>
                      {donation.foodItems?.join(", ")}
                    </strong>

                    <small>
                      {donation.quantity} {donation.quantityUnit}
                    </small>
                  </div>

                  <span className={`status ${donation.status === "Assigned" ? "expiring-status" : "active-status"}`}>
                    {donation.status} · {timeAgo(donation.createdAt)}
                  </span>
                </div>
              ))}

            </div>

            {/* Upcoming Pickups */}
            <div className="content-card">

              <div className="card-header">

                <h2>
                  Upcoming Pickups
                </h2>

                <Clock3 size={18} />

              </div>

              {loading && <p className="dashboard-empty">Loading…</p>}

              {!loading && upcomingPickups.length === 0 && (
                <p className="dashboard-empty">No upcoming pickups scheduled.</p>
              )}

              {!loading && upcomingPickups.map((pickup) => (
                <div className="pickup-row" key={pickup._id}>
                  <div>
                    <strong>
                      {pickup.ngo?.name || "NGO"}
                    </strong>

                    <small>
                      {pickup.status}
                    </small>
                  </div>

                  <span>
                    {formatPickupDate(pickup.pickupDate)}, {pickup.pickupTime}
                  </span>
                </div>
              ))}

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

            {loading && <p className="dashboard-empty">Loading…</p>}

            {!loading && recentActivity.length === 0 && (
              <p className="dashboard-empty">No activity yet — it'll show up here as you use FoodSaver AI.</p>
            )}

            {!loading && recentActivity.map((activity) => {
              const meta = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.donation;
              return (
                <button
                  type="button"
                  className="activity-row"
                  key={activity._id}
                  onClick={() =>
                    navigate(`${base}/activity`)
                  }
                >

                  <div className="activity-left">

                    <span className={`activity-icon ${meta.className}`}>
                      {meta.icon}
                    </span>

                    <div>
                      <strong>
                        {activity.title}
                      </strong>

                      <p>
                        {activity.description}
                      </p>
                    </div>

                  </div>

                  <span className="activity-type">
                    {timeAgo(activity.createdAt)}
                  </span>

                </button>
              );
            })}

          </section>

          {/* Quick Actions */}
          <QuickActions />

        </div>

      </main>

    </div>
  );
}

export default Dashboard;
