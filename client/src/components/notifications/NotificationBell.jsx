import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import "./NotificationBell.css";

/**
 * Bell icon with unread badge. Toggles the NotificationPanel dropdown.
 * Can be dropped into an existing Navbar without owning any layout.
 */
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const loadNotifications = () => {
    getNotifications().then(setNotifications);
    getUnreadCount().then(setUnreadCount);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    markAsRead(id).then((updated) => {
      setNotifications(updated);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  };

  return (
    <div className="notification-bell" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell__button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <span className="notification-bell__icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={18} />
        </span>
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
