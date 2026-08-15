import { Link } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import "./NotificationPanel.css";

/**
 * Dropdown panel showing the most recent notifications.
 * @param {{
 *   notifications: object[],
 *   onMarkAsRead: (id: number) => void,
 *   onMarkAllAsRead: () => void,
 *   onClose: () => void
 * }} props
 */
const NotificationPanel = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  const recentNotifications = notifications.slice(0, 5);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="notification-panel">
      <div className="notification-panel__header">
        <h3 className="notification-panel__title">Notifications</h3>
        {hasUnread && (
          <button
            type="button"
            className="notification-panel__mark-all"
            onClick={onMarkAllAsRead}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="notification-panel__list">
        {recentNotifications.length === 0 ? (
          <p className="notification-panel__empty">No notifications yet.</p>
        ) : (
          recentNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>

      <Link
        to="/notifications"
        className="notification-panel__view-all"
        onClick={onClose}
      >
        View all notifications
      </Link>
    </div>
  );
};

export default NotificationPanel;
