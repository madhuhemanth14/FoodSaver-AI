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
import { getNgoDashboard } from "../../services/ngoService";
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

/**
 * A real, dedicated NGO dashboard — no longer reusing the donor Dashboard.
 * Every number and list here comes from GET /api/ngos/dashboard, which
 * aggregates donations/pickups actually tied to this NGO's own
 * organization (NGO.user), not hardcoded or borrowed donor data.
 */
function NgoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name || "Guest";

  const [unreadCount, setUnreadCount] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [dashboard, unread] = await Promise.all([
          getNgoDashboard(),
          getUnreadCount().catch(() => 0),
        ]);
        if (!cancelled) {
          setData(dashboard);
          setUnreadCount(unread);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "Your NGO profile isn't set up yet. Finish it under Profile to start receiving donations."
              : err.response?.data?.message || "Couldn't load your NGO dashboard."
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

  const stats = data?.stats;
  const availableDonations = data?.availableDonations || [];
  const assignedDonations = data?.assignedDonations || [];
  const upcomingPickups = data?.upcomingPickups || [];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🌿</div>

        <button type="button" className="sidebar-btn active" title="Dashboard" onClick={() => navigate("/ngo/dashboard")}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button type="button" className="sidebar-btn" title="Notifications" onClick={() => navigate("/ngo/notifications")}>
          <span className="sidebar-icon-wrapper">
            <Bell size={20} />
            {unreadCount > 0 && <span className="sidebar-badge">{unreadCount}</span>}
          </span>
          <span>Notifications</span>
        </button>

        <button type="button" className="sidebar-btn" title="Pickups" onClick={() => navigate("/ngo/pickups")}>
          <Clock3 size={20} />
          <span>Pickups</span>
        </button>

        <button type="button" className="sidebar-btn" title="Organization Profile" onClick={() => navigate("/ngo/profile")}>
          <User size={20} />
          <span>Profile</span>
        </button>

        <button type="button" className="sidebar-btn" title="Settings" onClick={() => navigate("/ngo/profile")}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="top-header">
          <div className="header-brand">
            <span className="brand-leaf">🌿</span>
            <div>
              <h2>FoodSaver AI</h2>
              <span>NGO Dashboard</span>
            </div>
          </div>

          <div className="header-actions">
            <button type="button" className="header-icon-btn" title="Notifications" onClick={() => navigate("/ngo/notifications")}>
              <Bell size={21} />
              {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
            </button>
            <button type="button" className="header-profile-btn" title="Profile" onClick={() => navigate("/ngo/profile")}>
              <User size={21} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-heading">
            <h1>Welcome back, {displayName} 👋</h1>
            <p>Here's what's happening with incoming donations and pickups today.</p>
          </section>

          {error && (
            <section className="dashboard-error" role="alert">
              <p>{error}</p>
            </section>
          )}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div>
                <h2>{loading ? "—" : stats?.availableDonations ?? 0}</h2>
                <p>Available Donations</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div>
                <h2>{loading ? "—" : stats?.assignedDonations ?? 0}</h2>
                <p>Assigned Donations</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚚</div>
              <div>
                <h2>{loading ? "—" : stats?.upcomingPickups ?? 0}</h2>
                <p>Upcoming Pickups</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div>
                <h2>{loading ? "—" : stats?.completedPickups ?? 0}</h2>
                <p>Completed Pickups</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌍</div>
              <div>
                <h2>{loading ? "—" : stats?.foodReceived ?? 0}</h2>
                <p>Food Received (kg)</p>
              </div>
            </div>
          </section>

          <section className="two-column">
            <div className="content-card">
              <div className="card-header">
                <h2>Available Donations</h2>
                <button type="button" onClick={() => navigate("/ngo/donations")}>View</button>
              </div>

              {loading && <p className="dashboard-empty">Loading…</p>}
              {!loading && availableDonations.length === 0 && (
                <p className="dashboard-empty">No donations available to claim right now.</p>
              )}
              {!loading && availableDonations.slice(0, 5).map((d) => (
                <div className="list-row" key={d._id}>
                  <div>
                    <strong>{d.foodItems?.join(", ")}</strong>
                    <small>{d.quantity} {d.quantityUnit} · {d.donorName}</small>
                  </div>
                  <span className="status active-status">{timeAgo(d.createdAt)}</span>
                </div>
              ))}
            </div>

            <div className="content-card">
              <div className="card-header">
                <h2>Upcoming Pickups</h2>
                <Clock3 size={18} />
              </div>

              {loading && <p className="dashboard-empty">Loading…</p>}
              {!loading && upcomingPickups.length === 0 && (
                <p className="dashboard-empty">No upcoming pickups scheduled.</p>
              )}
              {!loading && upcomingPickups.map((p) => (
                <div className="pickup-row" key={p._id}>
                  <div>
                    <strong>{p.donorName}</strong>
                    <small>{p.status}</small>
                  </div>
                  <span>{new Date(p.pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}, {p.pickupTime}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="recent-card">
            <div className="recent-header">
              <div>
                <h2>Assigned Donations</h2>
                <p>Donations currently assigned to your organization</p>
              </div>
              <button type="button" onClick={() => navigate("/ngo/donations")}>View all</button>
            </div>

            {loading && <p className="dashboard-empty">Loading…</p>}
            {!loading && assignedDonations.length === 0 && (
              <p className="dashboard-empty">Nothing assigned to you yet.</p>
            )}
            {!loading && assignedDonations.map((d) => (
              <button
                type="button"
                className="activity-row"
                key={d._id}
                onClick={() => navigate(`/ngo/donations/${d._id}`)}
              >
                <div className="activity-left">
                  <span className="activity-icon donation-icon">📦</span>
                  <div>
                    <strong>{d.foodItems?.join(", ")}</strong>
                    <p>{d.donorName} · {d.quantity} {d.quantityUnit}</p>
                  </div>
                </div>
                <span className="activity-type">{d.status}</span>
              </button>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default NgoDashboard;
