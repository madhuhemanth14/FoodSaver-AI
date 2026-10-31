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

  const safeStats = stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalDonations: 0,
    pendingDonations: 0,
    completedDonations: 0,
    foodSaved: 0,
    activeNGOs: 0,
    successfulPickups: 0,
  };

  return (
    <div className="admin-layout admin-dashboard-page">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar admin={user} unreadCount={unreadCount} />
        <main className="admin-layout__content admin-dashboard">
          <div className="admin-dashboard__welcome-banner">
            <div>
              <div className="admin-status-pill">
                <span className="admin-status-dot"></span>
                <span>MongoDB Atlas Real-Time Synced</span>
              </div>
              <h1 className="admin-dashboard__title">Welcome back, {user?.name || "Administrator"}</h1>
              <p className="admin-dashboard__subtitle">Platform-wide statistics and live community activity across FoodSaver AI.</p>
            </div>
          </div>

          {error && (
            <div className="admin-dashboard__stats-loading" role="alert">{error}</div>
          )}

          {loadingStats ? (
            <div className="admin-dashboard__stats-loading">Loading live platform statistics…</div>
          ) : (
            <div className="admin-dashboard__stats-grid">
              <StatCard title="Total Users" value={safeStats.totalUsers.toLocaleString()} icon={<Users size={18} />} description="Registered accounts" />
              <StatCard title="Active Users" value={safeStats.activeUsers.toLocaleString()} icon={<UserCheck size={18} />} description="Donors & partner NGOs" />
              <StatCard title="Total Donations" value={safeStats.totalDonations.toLocaleString()} icon={<Package size={18} />} description="All-time listings" />
              <StatCard title="Pending Donations" value={safeStats.pendingDonations.toLocaleString()} icon={<Clock size={18} />} description="Awaiting pickup/claim" />
              <StatCard title="Completed Donations" value={safeStats.completedDonations.toLocaleString()} icon={<CheckCircle2 size={18} />} description="Successfully delivered" />
              <StatCard title="Food Saved" value={`${safeStats.foodSaved.toLocaleString()} kg`} icon={<Leaf size={18} />} description="Cumulative rescued food" />
              <StatCard title="Active NGOs" value={safeStats.activeNGOs.toLocaleString()} icon={<Building2 size={18} />} description="Verified charity partners" />
              <StatCard title="Successful Pickups" value={safeStats.successfulPickups.toLocaleString()} icon={<Truck size={18} />} description="Completed logistics" />
            </div>
          )}

          <section className="admin-dashboard__activity">
            <div className="admin-dashboard__section-header">
              <h2>Recent Community Activity</h2>
              <span className="admin-dashboard__activity-hint">Real-time audit log</span>
            </div>
            <ActivityTable activities={activity} loading={loadingActivity} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
