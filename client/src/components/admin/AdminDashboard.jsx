import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import StatCard from "../../components/admin/StatCard";
import {
  getDashboardStats,
  getRecentActivity,
  getDonations,
  getUsers,
} from "../../services/adminService";
import "../../components/admin/adminComponents.css";
import "./admin.css";

// NOTE ON AUTH (see also App-level routing notes at the bottom of this
// module's integration guide): this page assumes the existing auth
// system (owned by Member 2) has already confirmed the visitor is
// logged in and exposes the current user somehow (context/hook/props).
// Any role check performed here is for UI/navigation convenience only —
// it is NOT a security boundary. The backend must independently verify
// the ADMIN role before honoring any admin API request.

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      const [statsData, activityData, donationsData, usersData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
        getDonations(),
        getUsers(),
      ]);

      if (!isMounted) return;
      setStats(statsData);
      setActivity(activityData);
      setRecentDonations(donationsData.slice(0, 5));
      setRecentUsers(usersData.slice(0, 5));
      setLoading(false);
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={"admin-shell" + (sidebarOpen ? " admin-sidebar-open" : "")}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-content-area">
        <AdminNavbar
          pageTitle="Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="admin-main">
          <div className="admin-page-header">
            <div>
              <span className="admin-eyebrow">Control Center</span>
              <h1>Welcome back, Admin</h1>
              <p>Here&apos;s what&apos;s happening across FoodSaver-AI today.</p>
            </div>
          </div>

          {loading || !stats ? (
            <div className="admin-page-loading">Loading dashboard data…</div>
          ) : (
            <>
              <div className="admin-stat-grid">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon="\uD83D\uDC65"
                  change="+6.2% this month"
                />
                <StatCard
                  title="Total Donations"
                  value={stats.totalDonations.toLocaleString()}
                  icon="\uD83C\uDF71"
                  change="+9.1% this month"
                />
                <StatCard
                  title="Food Saved"
                  value={`${stats.foodSavedKg.toLocaleString()} kg`}
                  icon="\u267B"
                  change="+4.8% this month"
                />
                <StatCard
                  title="Active NGOs"
                  value={stats.activeNGOs.toLocaleString()}
                  icon="\uD83E\uDD1D"
                  change="+2 this month"
                />
                <StatCard
                  title="Completed Pickups"
                  value={stats.completedPickups.toLocaleString()}
                  icon="\uD83D\uDE9A"
                  description="Successfully delivered to NGOs"
                />
                <StatCard
                  title="Pending Donations"
                  value={stats.pendingDonations.toLocaleString()}
                  icon="\u23F3"
                  description="Awaiting pickup confirmation"
                  changeDirection="down"
                />
                <StatCard
                  title="Meals Supported"
                  value={stats.mealsSupported.toLocaleString()}
                  icon="\uD83C\uDF7D"
                  description="Estimated from donated food"
                />
                <StatCard
                  title="Waste Reduced"
                  value={`${stats.wasteReducedKg.toLocaleString()} kg`}
                  icon="\uD83C\uDF31"
                  description="Diverted from landfills"
                />
              </div>

              <div className="admin-panel-grid">
                <div className="admin-panel">
                  <h2>Recent Donations</h2>
                  <ul className="admin-activity-list">
                    {recentDonations.map((d) => (
                      <li key={d.id} className="admin-activity-item">
                        <span
                          className="admin-activity-dot"
                          data-type="donation"
                          aria-hidden="true"
                        />
                        <span className="admin-activity-text">
                          <strong>{d.foodName}</strong> ({d.quantity}) donated by{" "}
                          {d.donor} — {d.status}
                          <span className="admin-activity-time">
                            {d.donationDate} · {d.location}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="admin-panel-sub">
                    <h2>Recent Users</h2>
                    <ul className="admin-activity-list">
                      {recentUsers.map((u) => (
                        <li key={u.id} className="admin-activity-item">
                          <span
                            className="admin-activity-dot"
                            data-type="user"
                            aria-hidden="true"
                          />
                          <span className="admin-activity-text">
                            <strong>{u.name}</strong> joined as {u.role}
                            <span className="admin-activity-time">
                              {u.registeredOn} · {u.status}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="admin-panel">
                  <h2>Recent Activity</h2>
                  <ul className="admin-activity-list">
                    {activity.map((a) => (
                      <li key={a.id} className="admin-activity-item">
                        <span
                          className="admin-activity-dot"
                          data-type={a.type}
                          aria-hidden="true"
                        />
                        <span className="admin-activity-text">
                          {a.message}
                          <span className="admin-activity-time">{a.timestamp}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="admin-panel-sub">
                    <h2>Donation Overview</h2>
                    <div className="admin-mini-row">
                      <span>Total donations</span>
                      <span>{stats.totalDonations}</span>
                    </div>
                    <div className="admin-mini-row">
                      <span>Pending donations</span>
                      <span>{stats.pendingDonations}</span>
                    </div>
                    <div className="admin-mini-row">
                      <span>Completed pickups</span>
                      <span>{stats.completedPickups}</span>
                    </div>
                    <div className="admin-mini-row">
                      <span>Food saved</span>
                      <span>{stats.foodSavedKg} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-panel admin-panel-sub">
                <h2>Impact Statistics</h2>
                <div className="admin-impact-grid">
                  <div className="admin-impact-card">
                    <span className="value">{stats.foodSavedKg.toLocaleString()} kg</span>
                    <span className="label">Food saved</span>
                  </div>
                  <div className="admin-impact-card">
                    <span className="value">{stats.mealsSupported.toLocaleString()}</span>
                    <span className="label">Meals supported</span>
                  </div>
                  <div className="admin-impact-card">
                    <span className="value">{stats.completedPickups.toLocaleString()}</span>
                    <span className="label">Successful pickups</span>
                  </div>
                  <div className="admin-impact-card">
                    <span className="value">{stats.wasteReducedKg.toLocaleString()} kg</span>
                    <span className="label">Waste reduced</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
