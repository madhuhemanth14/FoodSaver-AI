import React from "react";
import { STATUS_LABELS } from "../data/mockDonations";

const TIMELINE_STEPS = ["AVAILABLE", "ACCEPTED", "PICKUP_SCHEDULED", "PICKED_UP", "COMPLETED"];

/**
 * StatusBadge
 * Small colored pill representing a donation's current status.
 * Props: - status: one of DONATION_STATUSES
 */
export function StatusBadge({ status }) {
  const key = (status || "").toLowerCase();
  const label = STATUS_LABELS[status] || status;
  return <span className={`fs-status-badge fs-status-${key}`}>{label}</span>;
}

/**
 * StatusTimeline
 * Horizontal timeline: Available → Accepted → Pickup Scheduled → Picked Up
 * → Completed, with the current status highlighted. If the donation was
 * cancelled, shows a single cancelled state instead.
 * Props: - status: one of DONATION_STATUSES
 */
export function StatusTimeline({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="fs-timeline fs-timeline-cancelled" aria-label="Donation status: Cancelled">
        <div className="fs-timeline-item">
          <span className="fs-timeline-dot fs-timeline-dot-active" />
          <span className="fs-timeline-label fs-timeline-label-active">Cancelled</span>
        </div>
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.indexOf(status);

  return (
    <div className="fs-timeline" aria-label="Donation status timeline">
      {TIMELINE_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <React.Fragment key={step}>
            {index > 0 && <span className="fs-timeline-arrow" aria-hidden="true">→</span>}
            <div className="fs-timeline-item">
              <span
                className={[
                  "fs-timeline-dot",
                  isActive ? "fs-timeline-dot-active" : "",
                  isDone ? "fs-timeline-dot-done" : "",
                ].join(" ").trim()}
              />
              <span className={`fs-timeline-label ${isActive ? "fs-timeline-label-active" : ""}`}>
                {STATUS_LABELS[step]}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StatusBadge;
