import { useState } from "react";
import "./Dashboard.css";

import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatCard from "../../components/dashboard/StatCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import QuickActions from "../../components/dashboard/QuickActions";

import NotificationBell from "../../components/notifications/NotificationBell";
import NotificationPanel from "../../components/notifications/NotificationPanel";

function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New pickup scheduled",
      message: "Your Veg Pulao donation is scheduled for pickup.",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Donation accepted",
      message: "Your food donation was accepted by the NGO.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Food analysis completed",
      message: "Your food analysis has been completed.",
      time: "2 hours ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="dashboard-page">

      {/* TOP BAR */}
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-logo">
            FS
          </div>

          <div>
            <h1>FoodSaver AI</h1>
            <span>User Dashboard</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="notification-wrapper">
            <NotificationBell
              unreadCount={unreadCount}
              onClick={() =>
                setShowNotifications((current) => !current)
              }
            />

            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            )}
          </div>

          <div className="profile-avatar">S</div>
        </div>
      </header>

      {/* WELCOME */}
      <section className="welcome-section">
        <WelcomeCard />
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          <StatCard
            title="Total Donations"
            value="25"
            icon="🍱"
          />

          <StatCard
            title="Meals Served"
            value="1,240"
            icon="👥"
          />

          <StatCard
            title="Food Saved"
            value="330 Kg"
            icon="🥗"
          />

          <StatCard
            title="CO₂ Reduced"
            value="256 Kg"
            icon="🌱"
          />
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="section-block">
        <div className="section-heading">
          <h2>Quick Actions</h2>
          <span>Do more</span>
        </div>

        <QuickActions />
      </section>

      {/* RECENT ACTIVITY */}
      <section className="section-block">
        <div className="section-heading">
          <h2>Recent Activity</h2>
          <button className="view-all-btn">View All</button>
        </div>

        <RecentActivity />
      </section>

      {/* IMPACT BANNER */}
      <section className="impact-card">
        <div className="impact-icon">🌱</div>

        <div className="impact-content">
          <h3>You're making an impact!</h3>
          <p>
            Every donation helps reduce food waste and support
            people in need.
          </p>
        </div>
      </section>

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-navigation">
        <button className="nav-item active">
          <span>⌂</span>
          <small>Home</small>
        </button>

        <button className="nav-item">
          <span>🍱</span>
          <small>Donations</small>
        </button>

        <button className="nav-item">
          <span>🔔</span>
          <small>Alerts</small>
        </button>

        <button className="nav-item">
          <span>👤</span>
          <small>Profile</small>
        </button>
      </nav>

    </div>
  );
}

export default Dashboard;