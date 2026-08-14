import NotificationItem from "./NotificationItem";

function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) {
  return (
    <div className="notification-panel">
      <div className="notification-panel-header">
        <h3>Notifications</h3>

        <button onClick={onMarkAllAsRead}>
          Mark all as read
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="empty-notifications">
            No notifications
          </p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;