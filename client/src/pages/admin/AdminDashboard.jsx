import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import StatCard from "../../components/admin/StatCard";
import ActivityTable from "../../components/admin/ActivityTable";
import { getDashboardStats, getRecentActivity } from "../../services/adminService";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

/**
 * AdminDashboard
 * Route: /admin
 *
 * Assumes the surrounding app has already verified the logged-in user has
 * role === "ADMIN" before rendering this route (see ProtectedRoute owned by
 * the auth module). This component does not perform its own auth check.
 */
function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getDashboardStats()
      .then((data) => {
        if (isMounted) {
          setStats(data);
          setLoadingStats(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || "Couldn't load platform statistics.");
          setLoadingStats(false);
        }
      });

    getRecentActivity().then((data) => {
      if (isMounted) {
        setActivity(data);
        setLoadingActivity(false);
      }
    });

    getUnreadCount()
      .then((count) => isMounted && setUnreadCount(count))
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="admin-layout admin-dashboard">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName={user?.name || "Admin"} notificationCount={unreadCount} />
        <main className="admin-layout__content">
          <div className="admin-dashboard__welcome">
            <h1>Welcome, {user?.name || "Admin"}</h1>
            <p>Here's what's happening across FoodSaver AI today.</p>
          </div>

          {error && (
            <div className="admin-dashboard__stats-loading" role="alert">{error}</div>
          )}

          {loadingStats ? (
            <div className="admin-dashboard__stats-loading">Loading statistics…</div>
          ) : (
            <div className="admin-dashboard__stats-grid">
              <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon="◍" />
              <StatCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon="●" />
              <StatCard title="Total Donations" value={stats.totalDonations.toLocaleString()} icon="◈" />
              <StatCard title="Pending Donations" value={stats.pendingDonations.toLocaleString()} icon="◔" />
              <StatCard title="Completed Donations" value={stats.completedDonations.toLocaleString()} icon="✔" />
              <StatCard title="Food Saved" value={`${stats.foodSaved.toLocaleString()} kg`} icon="⚘" />
              <StatCard title="Active NGOs" value={stats.activeNGOs.toLocaleString()} icon="◎" />
              <StatCard title="Successful Pickups" value={stats.successfulPickups.toLocaleString()} icon="▲" />
            </div>
          )}

          <section className="admin-dashboard__activity">
            <div className="admin-dashboard__section-header">
              <h2>Recent Activity</h2>
            </div>
            <ActivityTable activities={activity} loading={loadingActivity} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
