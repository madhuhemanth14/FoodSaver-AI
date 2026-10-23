import {
  FileText,
  HeartHandshake,
  Calendar,
  Truck,
  Package,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";

function PickupStatus({ status = "REQUESTED" }) {
  const statusConfig = {
    REQUESTED: {
      label: "Pickup Requested",
      icon: <FileText size={16} />,
      className: "requested",
    },
    NGO_ACCEPTED: {
      label: "NGO Accepted",
      icon: <HeartHandshake size={16} />,
      className: "accepted",
    },
    SCHEDULED: {
      label: "Pickup Scheduled",
      icon: <Calendar size={16} />,
      className: "scheduled",
    },
    PICKUP_ASSIGNED: {
      label: "Pickup Assigned",
      icon: <Truck size={16} />,
      className: "assigned",
    },
    PICKED_UP: {
      label: "Food Picked Up",
      icon: <Package size={16} />,
      className: "picked-up",
    },
    COMPLETED: {
      label: "Pickup Completed",
      icon: <CheckCircle2 size={16} />,
      className: "completed",
    },
    REJECTED: {
      label: "Pickup Rejected",
      icon: <XCircle size={16} />,
      className: "rejected",
    },
    CANCELLED: {
      label: "Pickup Cancelled",
      icon: <Ban size={16} />,
      className: "cancelled",
    },
  };

  const currentStatus =
    statusConfig[status] || statusConfig.REQUESTED;

  return (
    <div
      className={`pickup-status pickup-status--${currentStatus.className}`}
    >
      <span className="pickup-status__icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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