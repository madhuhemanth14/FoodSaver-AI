import { useState } from "react";
import NotificationItem from "../../components/notifications/NotificationItem";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    title: "Donation Accepted",
    message: "Your food donation has been accepted by the NGO.",
    type: "Donation",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Pickup Scheduled",
    message: "Your food pickup is scheduled for 4:30 PM.",
    type: "Pickup",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Food Analysis Complete",
    message: "Your food analysis has been completed successfully.",
    type: "AI",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    title: "Food Expiry Warning",
    message: "Some of your stored food may expire soon.",
    type: "Expiry",
    time: "Yesterday",
    read: false,
  },
  {
    id: 5,
    title: "Welcome to FoodSaver AI",
    message: "Thank you for helping reduce food waste.",
    type: "System",
    time: "Yesterday",
    read: true,
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(
    initialNotifications
  );

  const [filter, setFilter] = useState("All");

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

  const filteredNotifications = notifications.filter(
    (notification) => {
      if (filter === "All") {
        return true;
      }

      if (filter === "Unread") {
        return !notification.read;
      }

      return notification.type === filter;
    }
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-filters">
        {[
          "All",
          "Unread",
          "Donation",
          "Pickup",
          "AI",
          "Expiry",
          "System",
        ].map((item) => (
          <button
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications found</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;