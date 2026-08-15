import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import StatCard from "../../components/admin/StatCard";
import ActivityTable from "../../components/admin/ActivityTable";
import { getDashboardStats, getRecentActivity } from "../../services/adminService";
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
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDashboardStats().then((data) => {
      if (isMounted) {
        setStats(data);
        setLoadingStats(false);
      }
    });

    getRecentActivity().then((data) => {
      if (isMounted) {
        setActivity(data);
        setLoadingActivity(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="admin-layout admin-dashboard">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName="Admin" notificationCount={3} />
        <main className="admin-layout__content">
          <div className="admin-dashboard__welcome">
            <h1>Welcome, Admin</h1>
            <p>Here's what's happening across FoodSaver AI today.</p>
          </div>

          {loadingStats ? (
            <div className="admin-dashboard__stats-loading">Loading statistics…</div>
          ) : (
            <div className="admin-dashboard__stats-grid">
              <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon="◍" trend="+12%" description="this month" />
              <StatCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon="●" trend="+9%" description="this month" />
              <StatCard title="Total Donations" value={stats.totalDonations.toLocaleString()} icon="◈" trend="+8%" description="this month" />
              <StatCard title="Pending Donations" value={stats.pendingDonations.toLocaleString()} icon="◔" trend="-3%" description="vs last month" />
              <StatCard title="Completed Donations" value={stats.completedDonations.toLocaleString()} icon="✔" trend="+11%" description="this month" />
              <StatCard title="Food Saved" value={`${stats.foodSaved.toLocaleString()} kg`} icon="⚘" trend="+15%" description="this month" />
              <StatCard title="Active NGOs" value={stats.activeNGOs.toLocaleString()} icon="◎" trend="+5%" description="this month" />
              <StatCard title="Successful Pickups" value={stats.successfulPickups.toLocaleString()} icon="▲" trend="+10%" description="this month" />
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
