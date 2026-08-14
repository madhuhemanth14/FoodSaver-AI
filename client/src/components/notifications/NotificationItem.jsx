function NotificationItem({ notification, onMarkAsRead }) {
  return (
    <div
      className={`notification-item ${
        notification.read ? "read" : "unread"
      }`}
    >
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span>{notification.time}</span>
      </div>

      {notification.read ? (
  <span className="read-label">
    Read
  </span>
) : (
  <button
    onClick={() => onMarkAsRead(notification.id)}
  >
    Mark as read
  </button>
)}
    </div>
  );
}

export default NotificationItem;