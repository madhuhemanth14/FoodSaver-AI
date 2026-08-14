import { useState } from "react";
import "./Dashboard.css";

import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatCard from "../../components/dashboard/StatCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import QuickActions from "../../components/dashboard/QuickActions";
import NotificationBell from "../../components/notifications/NotificationBell";
import NotificationPanel from "../../components/notifications/NotificationPanel";

const initialNotifications = [
  {
    id: 1,
    title: "Donation Accepted",
    message: "Your food donation has been accepted by the NGO.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Pickup Scheduled",
    message: "Your food pickup is scheduled for 4:30 PM.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Food Analysis Complete",
    message: "Your food analysis has been completed successfully.",
    time: "2 hours ago",
    read: true,
  },
];

function Dashboard() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [showNotifications, setShowNotifications] = useState(false);

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
    <div className="dashboard">

      <div className="header">
        <div>
          <h1>FoodSaver AI</h1>
          <p>User Dashboard</p>
        </div>

        <div className="notification-wrapper">
          <NotificationBell
            unreadCount={unreadCount}
            onClick={() =>
              setShowNotifications(!showNotifications)
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
      </div>

      <WelcomeCard />

      <div className="stats">
        <StatCard
          title="Total Donations"
          value="25"
        />

        <StatCard
          title="Meals Served"
          value="1240"
        />

        <StatCard
          title="Food Saved"
          value="330 Kg"
        />

        <StatCard
          title="CO₂ Reduced"
          value="256 Kg"
        />
      </div>

      <QuickActions />

      <RecentActivity />

    </div>
  );
}

export default Dashboard;