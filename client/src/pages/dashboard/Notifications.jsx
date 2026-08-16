import { useEffect, useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";

import "./Notifications.css";

const filters = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "donation", label: "Donation" },
  { key: "pickup", label: "Pickup" },
  { key: "ai", label: "AI" },
  { key: "ngo", label: "NGO" },
  { key: "expiry", label: "Expiry" },
  { key: "system", label: "System" },
];

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const data = await getNotifications();

        if (active) {
          setNotifications(
            Array.isArray(data) ? data : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );

        if (active) {
          setNotifications([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.read
    ).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") {
      return notifications;
    }

    if (filter === "unread") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    return notifications.filter(
      (notification) => notification.type === filter
    );
  }, [notifications, filter]);

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await markAsRead(id);

      setNotifications(
        Array.isArray(updated) ? updated : []
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const updated = await markAllAsRead();

      setNotifications(
        Array.isArray(updated) ? updated : []
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "donation":
        return "📦";

      case "pickup":
        return "🚚";

      case "ai":
        return "🤖";

      case "ngo":
        return "🏢";

      case "expiry":
        return "⚠️";

      case "system":
        return "🌿";

      default:
        return "🔔";
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page-inner">

        {/* PAGE HEADER */}
        <div className="notifications-topbar">
          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with your FoodSaver AI activity.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-link-button"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>

        {/* ACTIONS */}
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-button"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="notification-filters">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={
                filter === item.key
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* NOTIFICATION LIST */}
        <section className="notification-page-list">

          {loading ? (
            <div className="notification-empty">
              <h3>Loading notifications...</h3>
              <p>Please wait.</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">
                🎉
              </div>

              <h3>You're all caught up</h3>

              <p>
                No notifications in this category.
              </p>
            </div>
          ) : (
            filteredNotifications.map(
              (notification) => (
                <article
                  key={notification.id}
                  className={
                    notification.read
                      ? "full-notification read"
                      : "full-notification unread"
                  }
                >

                  <div className="full-notification-icon">
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  <div className="full-notification-content">

                    <div className="notification-title-row">
                      <h3>
                        {notification.title}
                      </h3>

                      {!notification.read && (
                        <span className="unread-dot" />
                      )}
                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="notification-time">
                      {notification.time}
                    </span>

                  </div>

                  {!notification.read ? (
                    <button
                      type="button"
                      className="single-read-button"
                      onClick={() =>
                        handleMarkAsRead(
                          notification.id
                        )
                      }
                    >
                      Mark as read
                    </button>
                  ) : (
                    <span className="read-label">
                      Read
                    </span>
                  )}

                </article>
              )
            )
          )}

        </section>

      </div>
    </div>
  );
}

export default Notifications;