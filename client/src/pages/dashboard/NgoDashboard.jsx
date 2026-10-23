import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Clock3,
  Settings,
  User,
  Leaf,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getNgoDashboard } from "../../services/ngoService";
import PickupActions, { normalizePickupStatus } from "../../components/pickup/PickupActions";
import { acceptDonation, rejectDonation } from "../../services/donationService";
import { formatDateTime } from "../../utils/pickupDateTime";
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

  // Replace the pickup with the server-returned copy and keep the stat
  // counters in step (a Completed pickup no longer counts as upcoming).
  const [donationError, setDonationError] = useState("");
  const [busyDonationId, setBusyDonationId] = useState("");

  // Reload from the server so the lists always reflect what MongoDB holds
  // (accepted/closed/expired donations move between lists server-side).
  const reloadDashboard = async () => {
    try {
      setData(await getNgoDashboard());
    } catch (err) {
      setDonationError(err.response?.data?.message || "Couldn't refresh the dashboard.");
    }
  };

  const runDonationAction = async (donationId, action) => {
    setBusyDonationId(donationId);
    setDonationError("");
    try {
      await action(donationId);
    } catch (err) {
      setDonationError(err.response?.data?.message || "That action failed. Please try again.");
    } finally {
      await reloadDashboard();
      setBusyDonationId("");
    }
  };

  const handlePickupUpdated = (updated) => {
    setData((prev) => {
      if (!prev) return prev;
      const pickups = prev.upcomingPickups.map((p) => (p._id === updated._id ? { ...p, ...updated } : p));
      const justCompleted = updated.status === "Completed";
      return {
        ...prev,
        upcomingPickups: pickups,
        stats: {
          ...prev.stats,
          upcomingPickups: pickups.filter((p) => p.status !== "Completed").length,
          completedPickups: prev.stats.completedPickups + (justCompleted ? 1 : 0),
        },
      };
    });
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><Leaf size={24} color="#2e7d32" /></div>

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
            <span className="brand-leaf"><Leaf size={20} color="#2e7d32" /></span>
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
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-heading">
            <h1>Welcome back, {displayName}</h1>
            <p>Here's what's happening with incoming donations and pickups today.</p>
          </section>

          {error && (
            <section className="dashboard-error" role="alert">
              <p>{error}</p>
            </section>
          )}

          {donationError && (
            <section className="dashboard-error" role="alert">
              <p>{donationError}</p>
            </section>
          )}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={22} color="#2e7d32" /></div>
              <div>
                <h2>{loading ? "—" : stats?.availableDonations ?? 0}</h2>
                <p>Available Donations</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={22} color="#2e7d32" /></div>
              <div>
                <h2>{loading ? "—" : stats?.assignedDonations ?? 0}</h2>
                <p>Assigned Donations</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Truck size={22} color="#2e7d32" /></div>
              <div>
                <h2>{loading ? "—" : stats?.upcomingPickups ?? 0}</h2>
                <p>Upcoming Pickups</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={22} color="#2e7d32" /></div>
              <div>
                <h2>{loading ? "—" : stats?.completedPickups ?? 0}</h2>
                <p>Completed Pickups</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Leaf size={22} color="#2e7d32" /></div>
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
                  <div>
                    <span className="status active-status">{timeAgo(d.createdAt)}</span>
                    {d.expiryDate && <small style={{ display: "block" }}>Expires: {formatDateTime(d.expiryDate)}</small>}
                    <button
                      type="button"
                      onClick={() => runDonationAction(d._id, acceptDonation)}
                      disabled={busyDonationId === d._id}
                    >
                      {busyDonationId === d._id ? "Accepting..." : "Accept Donation"}
                    </button>
                  </div>
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
                    <small>{p.foodItems?.join(", ")} · {p.quantity} {p.quantityUnit}</small>
                    <small>Status: {normalizePickupStatus(p.status)}</small>
                    <PickupActions pickup={p} onUpdated={handlePickupUpdated} />
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
              <div className="activity-row" key={d._id}>
                <div className="activity-left">
                  <span className="activity-icon donation-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={16} /></span>
                  <div>
                    <strong>{d.foodItems?.join(", ")}</strong>
                    <p>{d.donorName} · {d.quantity} {d.quantityUnit}</p>
                    {d.expiryDate && <p>Expires: {formatDateTime(d.expiryDate)}</p>}
                    {d.status === "Accepted" && (
                      <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => navigate("/ngo/pickups/request", { state: { donationId: d._id } })}
                        >
                          Schedule Pickup
                        </button>
                        <button
                          type="button"
                          onClick={() => runDonationAction(d._id, rejectDonation)}
                          disabled={busyDonationId === d._id}
                        >
                          {busyDonationId === d._id ? "Releasing..." : "Release Donation"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <span className="activity-type">{d.status}</span>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default NgoDashboard;
