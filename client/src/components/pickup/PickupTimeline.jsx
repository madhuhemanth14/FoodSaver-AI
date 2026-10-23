import {
  FileText,
  HeartHandshake,
  Calendar,
  Truck,
  Package,
  CheckCircle2,
  Check,
} from "lucide-react";

function PickupTimeline({ status = "REQUESTED" }) {
  const steps = [
    {
      key: "REQUESTED",
      label: "Request Created",
      icon: <FileText size={14} />,
    },
    {
      key: "NGO_ACCEPTED",
      label: "NGO Accepted",
      icon: <HeartHandshake size={14} />,
    },
    {
      key: "SCHEDULED",
      label: "Pickup Scheduled",
      icon: <Calendar size={14} />,
    },
    {
      key: "PICKUP_ASSIGNED",
      label: "Pickup In Progress",
      icon: <Truck size={14} />,
    },
    {
      key: "PICKED_UP",
      label: "Food Picked Up",
      icon: <Package size={14} />,
    },
    {
      key: "COMPLETED",
      label: "Completed",
      icon: <CheckCircle2 size={14} />,
    },
  ];

  const statusOrder = {
    REQUESTED: 0,
    NGO_ACCEPTED: 1,
    SCHEDULED: 2,
    PICKUP_ASSIGNED: 3,
    PICKED_UP: 4,
    COMPLETED: 5,
  };

  const currentIndex =
    statusOrder[status] ?? 0;

  return (
    <div className="pickup-timeline">
      {steps.map((step, index) => {
        const isCompleted =
          index < currentIndex;

        const isCurrent =
          index === currentIndex;

        return (
          <div
            key={step.key}
            className={`pickup-timeline-item ${
              isCompleted
                ? "completed"
                : ""
            } ${
              isCurrent
                ? "current"
                : ""
            }`}
          >
            <div className="pickup-timeline-marker" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isCompleted
                ? <Check size={14} />
                : step.icon}
            </div>

            <div className="pickup-timeline-content">
              <strong>
                {step.label}
              </strong>

              {isCurrent && (
                <span>
                  Current status
                </span>
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={`pickup-timeline-line ${
                  isCompleted
                    ? "completed"
                    : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PickupTimeline;