import { FaBell } from "react-icons/fa";

function NotificationBell({ unreadCount, onClick }) {
  return (
    <button
      className="notification-bell"
      onClick={onClick}
      aria-label="Open notifications"
    >
      <FaBell />

      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

export default NotificationBell;