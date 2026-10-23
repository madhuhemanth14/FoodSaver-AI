import { useState } from "react";
import { updatePickupStatus } from "../../services/pickupService";
import { useAuth } from "../../context/AuthContext";

// Who does what, per current status:
//   Pending Confirmation -> DONOR confirms      (NGO waits)
//   Confirmed            -> NGO marks Picked Up
//   Picked Up            -> NGO marks Completed
//   Completed            -> nothing left to do
// Never more than one button. The backend enforces the same rules.
const ACTIONS = {
  donor: {
    "Pending Confirmation": { label: "Confirm Pickup", nextStatus: "Confirmed" },
  },
  ngo: {
    Confirmed: { label: "Mark Picked Up", nextStatus: "Picked Up" },
    "Picked Up": { label: "Mark Completed", nextStatus: "Completed" },
  },
};

const NOTES = {
  donor: {
    Confirmed: "You confirmed this pickup. The NGO will collect the food.",
    "Picked Up": "The NGO has collected your food.",
  },
  ngo: {
    "Pending Confirmation": "Waiting for the donor to confirm this pickup.",
  },
};

/** Legacy pickups stored "Pending"; show them as Pending Confirmation. */
export function normalizePickupStatus(status) {
  return !status || status === "Pending" ? "Pending Confirmation" : status;
}

function PickupActions({ pickup, onUpdated }) {
  const { user } = useAuth();
  const role = user?.role === "admin" ? "ngo" : user?.role;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const status = normalizePickupStatus(pickup.status);

  if (status === "Completed") {
    return <p style={{ margin: "8px 0 0", fontWeight: 600, color: "#28752f" }}>Pickup Completed</p>;
  }

  const action = ACTIONS[role]?.[status];
  const note = NOTES[role]?.[status];
  if (!action && !note) return null;

  const handleClick = async () => {
    setBusy(true);
    setError("");
    try {
      const updated = await updatePickupStatus(pickup._id, action.nextStatus);
      onUpdated?.(updated);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update the pickup. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: "8px" }}>
      {action ? (
        <button type="button" onClick={handleClick} disabled={busy}>
          {busy ? "Updating..." : action.label}
        </button>
      ) : (
        <p style={{ margin: 0, fontSize: "13px", color: "#6b7a70" }}>{note}</p>
      )}
      {error && (
        <p role="alert" style={{ margin: "6px 0 0", color: "#c0392b", fontSize: "13px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default PickupActions;
