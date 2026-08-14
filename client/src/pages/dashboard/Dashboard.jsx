import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  Package,
  Truck,
  Clock3,
  Settings,
  User,
  ChevronLeft,
} from "lucide-react";

import "./Dashboard.css";

import NotificationBell from "../../components/notifications/NotificationBell";
import NotificationPanel from "../../components/notifications/NotificationPanel";

function Dashboard() {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New pickup scheduled",
      message: "Your food donation is scheduled for pickup.",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Donation accepted",
      message: "Your donation was accepted by an NGO.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Food analysis completed",
      message: "Your food analysis has been completed.",
      time: "2 hours ago",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-user">
          <div className="sidebar-avatar">S</div>
        </div>

        <button
          className="sidebar-btn active"
          onClick={() => navigate("/dashboard")}
          type="button"
        >
          <LayoutDashboard size={21} />
        </button>

        <button
          className="sidebar-btn"
          onClick={() => navigate("/notifications")}
          type="button"
        >
          <Bell size={21} />
        </button>

        <button
          className="sidebar-btn"
          type="button"
        >
          <Package size={21} />
        </button>

        <button
          className="sidebar-btn"
          type="button"
        >
          <Truck size={21} />
        </button>

        <button
          className="sidebar-btn"
          onClick={() => navigate("/activity")}
          type="button"
        >
          <Clock3 size={21} />
        </button>

        <button
          className="sidebar-btn"
          onClick={() => navigate("/profile")}
          type="button"
        >
          <User size={21} />
        </button>

        <button
          className="sidebar-btn"
          type="button"
        >
          <Settings size={21} />
        </button>

        <button
          className="collapse-btn"
          type="button"
        >
          <ChevronLeft size={18} />
        </button>

      </aside>

      {/* MAIN */}
      <main className="dashboard-main">

        {/* TOP HEADER */}
        <header className="top-header">

          <div className="brand">
            <span className="brand-leaf">🌿</span>
            <strong>FoodSaver AI</strong>
          </div>

          <div className="top-actions">

            <div className="notification-wrapper">

              <NotificationBell
                unreadCount={unreadCount}
                onClick={() =>
                  setShowNotifications(
                    (current) => !current
                  )
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

            <button
              className="header-profile"
              onClick={() => navigate("/profile")}
              type="button"
            >
              <User size={22} />
            </button>

          </div>

        </header>

        {/* CONTENT */}
        <div className="dashboard-content">

          {/* WELCOME */}
          <section className="welcome-heading">
            <h1>Welcome back, Sowmya 👋</h1>
            <p>
              Here's what's happening with your donations today.
            </p>
          </section>

          {/* PROFILE SUMMARY */}
          <section className="profile-summary">

            <div className="large-avatar">
              S
            </div>

            <div className="profile-summary-text">
              <h2>Sowmya Dasari</h2>

              <p>
                Donor · FoodSaver AI
              </p>

              <span>
                sowmya@example.com
              </span>
            </div>

          </section>

          {/* ANALYTICS */}
          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon">📦</div>

              <div>
                <h2>25</h2>
                <p>Total Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🍽️</div>

              <div>
                <h2>1,240</h2>
                <p>Meals Served</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🟢</div>

              <div>
                <h2>6</h2>
                <p>Active Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🚚</div>

              <div>
                <h2>3</h2>
                <p>Pending Pickups</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🌍</div>

              <div>
                <h2>256</h2>
                <p>CO₂ Saved (kg)</p>
              </div>
            </div>

          </section>

          {/* TWO COLUMN CONTENT */}
          <section className="two-column">

            {/* ACTIVE DONATIONS */}
            <div className="content-card">

              <div className="card-header">
                <h2>Active Donations</h2>
              </div>

              <div className="list-row">
                <span>
                  Vegetable Biryani Trays (12)
                </span>

                <span className="status active-status">
                  Active · 3h
                </span>
              </div>

              <div className="list-row">
                <span>
                  Bakery Assortment
                </span>

                <span className="status active-status">
                  Active · 6h
                </span>
              </div>

              <div className="list-row">
                <span>
                  Packaged Fruit Bowls (40)
                </span>

                <span className="status expiring-status">
                  Expiring · 1h
                </span>
              </div>

            </div>

            {/* UPCOMING PICKUPS */}
            <div className="content-card">

              <div className="card-header">
                <h2>Upcoming Pickups</h2>
              </div>

              <div className="pickup-row">
                <span>
                  Sunrise Bakery
                </span>

                <span>
                  Today, 5:30 PM · Ramesh Kumar
                </span>
              </div>

              <div className="pickup-row">
                <span>
                  Green Table Kitchen
                </span>

                <span>
                  Today, 7:00 PM · Meena Iyer
                </span>
              </div>

            </div>

          </section>

          {/* RECENT ACTIVITIES */}
          <section className="recent-card">

            <div className="recent-header">

              <h2>Recent Activities</h2>

              <button
                onClick={() => navigate("/activity")}
                type="button"
              >
                View all
              </button>

            </div>

            <div className="activity-row clickable">

              <div className="activity-left">

                <span className="activity-icon donation-icon">
                  📦
                </span>

                <div>
                  <strong>
                    Listed a new donation
                  </strong>

                  <p>
                    Vegetable Biryani Trays · Today, 10:30 AM
                  </p>
                </div>

              </div>

              <span className="activity-type">
                Donation
              </span>

            </div>

            <div className="activity-row clickable">

              <div className="activity-left">

                <span className="activity-icon pickup-icon">
                  🚚
                </span>

                <div>
                  <strong>
                    Pickup scheduled
                  </strong>

                  <p>
                    Sunrise Bakery · Today, 5:30 PM
                  </p>
                </div>

              </div>

              <span className="activity-type">
                Pickup
              </span>

            </div>

            <div className="activity-row clickable">

              <div className="activity-left">

                <span className="activity-icon complete-icon">
                  ✅
                </span>

                <div>
                  <strong>
                    Donation completed
                  </strong>

                  <p>
                    Food successfully delivered · Yesterday
                  </p>
                </div>

              </div>

              <span className="activity-type">
                Completed
              </span>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;