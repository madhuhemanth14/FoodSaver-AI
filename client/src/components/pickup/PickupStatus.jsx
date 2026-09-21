function PickupStatus({ status = "REQUESTED" }) {
  const statusConfig = {
    REQUESTED: {
      label: "Pickup Requested",
      icon: "📋",
      className: "requested",
    },
    NGO_ACCEPTED: {
      label: "NGO Accepted",
      icon: "🤝",
      className: "accepted",
    },
    SCHEDULED: {
      label: "Pickup Scheduled",
      icon: "📅",
      className: "scheduled",
    },
    PICKUP_ASSIGNED: {
      label: "Pickup Assigned",
      icon: "🚚",
      className: "assigned",
    },
    PICKED_UP: {
      label: "Food Picked Up",
      icon: "📦",
      className: "picked-up",
    },
    COMPLETED: {
      label: "Pickup Completed",
      icon: "✅",
      className: "completed",
    },
    REJECTED: {
      label: "Pickup Rejected",
      icon: "❌",
      className: "rejected",
    },
    CANCELLED: {
      label: "Pickup Cancelled",
      icon: "🚫",
      className: "cancelled",
    },
  };

  const currentStatus =
    statusConfig[status] || statusConfig.REQUESTED;

  return (
    <div
      className={`pickup-status pickup-status--${currentStatus.className}`}
    >
      <span className="pickup-status__icon">
        {currentStatus.icon}
      </span>

      <div className="pickup-status__content">
        <span className="pickup-status__label">
          Current Status
        </span>

        <strong>{currentStatus.label}</strong>
      </div>
    </div>
  );
}

export default PickupStatus;