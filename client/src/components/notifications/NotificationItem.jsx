import "./NotificationItem.css";

const TYPE_META = {
  donation: { icon: "🍲", className: "notification-item--donation" },
  pickup: { icon: "🚚", className: "notification-item--pickup" },
  ai: { icon: "🤖", className: "notification-item--ai" },
  expiry: { icon: "⏰", className: "notification-item--expiry" },
  ngo: { icon: "🏠", className: "notification-item--ngo" },
  system: { icon: "⚙️", className: "notification-item--system" },
};

/**
 * Single notification row used inside the panel and the notifications page.
 * @param {{ notification: object, onMarkAsRead: (id: number) => void }} props
 */
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const { id, type, title, message, read, createdAt } = notification;
  const meta = TYPE_META[type] || TYPE_META.system;

  return (
    <div
      className={`notification-item ${meta.className} ${
        read ? "notification-item--read" : "notification-item--unread"
      }`}
    >
      <div className="notification-item__icon">{meta.icon}</div>
      <div className="notification-item__body">
        <div className="notification-item__header">
          <p className="notification-item__title">{title}</p>
          {!read && <span className="notification-item__dot" />}
        </div>
        <p className="notification-item__message">{message}</p>
        <span className="notification-item__time">{createdAt}</span>
      </div>
      {!read && (
        <button
          type="button"
          className="notification-item__mark-read"
          onClick={() => onMarkAsRead(id)}
        >
          Mark as read
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
