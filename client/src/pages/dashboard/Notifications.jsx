import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import notificationService from "../../services/notificationService";
import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    notificationService
      .getNotifications()
      .then((data) => {
        if (!cancelled) {
          setNotifications(data.notifications || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "donation_created": return "📦";
      case "analysis_completed": return "🔬";
      case "pickup_scheduled": return "🚚";
      case "donation_completed": return "✅";
      case "registration": return "🎉";
      case "expiry_warning": return "⚠️";
      default: return "🔔";
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <button className="notif-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="notif-header">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {loading && (
          <div className="notif-loading">
            <div className="notif-spinner" />
            <p>Loading notifications...</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="notif-empty">
            <p style={{ fontSize: 40 }}>🔔</p>
            <h3>No notifications yet</h3>
            <p>You'll see notifications about your donations and pickups here.</p>
          </div>
        )}

        <div className="notif-list">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${n.read ? "read" : "unread"}`}
            >
              <span className="notif-icon">{getIcon(n.type)}</span>
              <div className="notif-content">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              <div className="notif-actions">
                {!n.read && (
                  <button onClick={() => handleMarkRead(n._id)} title="Mark read">
                    ✓
                  </button>
                )}
                <button onClick={() => handleDelete(n._id)} title="Delete">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}