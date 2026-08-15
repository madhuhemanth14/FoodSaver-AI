import { useEffect, useMemo, useState } from "react";
import NotificationItem from "../../components/notifications/NotificationItem";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import "./Notifications.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "donation", label: "Donation" },
  { key: "pickup", label: "Pickup" },
  { key: "ai", label: "AI" },
  { key: "ngo", label: "NGO" },
  { key: "expiry", label: "Expiry" },
  { key: "system", label: "System" },
];

/**
 * Member 5 — Notifications page.
 * Full list with filtering, mark-as-read, and mark-all-as-read.
 */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const handleMarkAsRead = (id) => {
    markAsRead(id).then(setNotifications);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead().then(setNotifications);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <div>
          <h1 className="notifications-page__title">Notifications</h1>
          <p className="notifications-page__subtitle">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount > 1 ? "s" : ""
                }`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notifications-page__mark-all"
            onClick={handleMarkAllAsRead}
          >
            Mark All Read
          </button>
        )}
      </div>

      <div className="notifications-page__filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`notifications-page__filter ${
              activeFilter === filter.key
                ? "notifications-page__filter--active"
                : ""
            }`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="notifications-page__list">
        {loading ? (
          <p className="notifications-page__empty">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="notifications-page__empty">
            No notifications in this category.
          </p>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
