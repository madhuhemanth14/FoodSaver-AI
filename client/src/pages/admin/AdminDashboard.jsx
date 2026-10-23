import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Package,
  Clock,
  CheckCircle2,
  Leaf,
  Building2,
  Truck,
} from "lucide-react";
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

    const loadData = async () => {
      try {
        setError("");
        const [statsData, activityData, unread] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
          getUnreadCount().catch(() => 0),
        ]);

        if (isMounted) {
          setStats(statsData);
          setActivity(Array.isArray(activityData) ? activityData : []);
          setUnreadCount(unread);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load administrative overview."
          );
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
          setLoadingActivity(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-shell__main">
        <AdminNavbar admin={user} unreadCount={unreadCount} />
        <main className="admin-dashboard">
          <div className="admin-dashboard__header">
            <div>
              <h1 className="admin-dashboard__title">Overview</h1>
              <p className="admin-dashboard__subtitle">Platform-wide statistics and activity</p>
            </div>
          </div>

          {error && (
            <div className="admin-dashboard__stats-loading" role="alert">{error}</div>
          )}

          {loadingStats ? (
            <div className="admin-dashboard__stats-loading">Loading statistics…</div>
          ) : (
            <div className="admin-dashboard__stats-grid">
              <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<Users size={18} />} />
              <StatCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon={<UserCheck size={18} />} />
              <StatCard title="Total Donations" value={stats.totalDonations.toLocaleString()} icon={<Package size={18} />} />
              <StatCard title="Pending Donations" value={stats.pendingDonations.toLocaleString()} icon={<Clock size={18} />} />
              <StatCard title="Completed Donations" value={stats.completedDonations.toLocaleString()} icon={<CheckCircle2 size={18} />} />
              <StatCard title="Food Saved" value={`${stats.foodSaved.toLocaleString()} kg`} icon={<Leaf size={18} />} />
              <StatCard title="Active NGOs" value={stats.activeNGOs.toLocaleString()} icon={<Building2 size={18} />} />
              <StatCard title="Successful Pickups" value={stats.successfulPickups.toLocaleString()} icon={<Truck size={18} />} />
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
