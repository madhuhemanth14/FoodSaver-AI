// Pickup date/time helpers. All of these read the CURRENT clock each time
// they are called (nothing is hard-coded) and work in the browser's local
// timezone. The backend re-validates everything and is the final authority.

const pad = (n) => String(n).padStart(2, "0");

/** Local calendar date as YYYY-MM-DD (not UTC — toISOString() would be wrong near midnight). */
export function toLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local time as HH:mm. */
export function toLocalTimeString(date = new Date()) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "YYYY-MM-DD" + "HH:mm" in local time -> Date (or null). */
export function combineLocal(dateStr, timeStr) {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || "");
  const t = /^(\d{1,2}):(\d{2})$/.exec(timeStr || "");
  if (!d || !t) return null;
  const out = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[1]), Number(t[2]), 0, 0);
  return Number.isNaN(out.getTime()) ? null : out;
}

/** Earliest selectable date: today, always computed from the real clock. */
export function minPickupDate() {
  return toLocalDateString(new Date());
}

/** Latest selectable date: the food's expiry day (or undefined if no expiry). */
export function maxPickupDate(expiryDate) {
  return expiryDate ? toLocalDateString(new Date(expiryDate)) : undefined;
}

/**
 * Min/max for the time input given the chosen date: today -> not before the
 * next minute; the expiry day -> not at/after the expiry time.
 */
export function timeBounds(dateStr, expiryDate) {
  const bounds = {};
  if (dateStr && dateStr === toLocalDateString(new Date())) {
    bounds.min = toLocalTimeString(new Date(Date.now() + 60 * 1000));
  }
  if (dateStr && expiryDate && dateStr === toLocalDateString(new Date(expiryDate))) {
    bounds.max = toLocalTimeString(new Date(new Date(expiryDate).getTime() - 60 * 1000));
  }
  return bounds;
}

/**
 * Validate date + time TOGETHER as one pickup instant.
 * Returns an error message, or "" when valid.
 */
export function validatePickup(dateStr, timeStr, expiryDate) {
  if (!dateStr) return "Please choose a pickup date.";
  if (!timeStr) return "Please choose a pickup time.";
  const when = combineLocal(dateStr, timeStr);
  if (!when) return "Please enter a valid pickup date and time.";
  const now = new Date();
  if (when.getTime() <= now.getTime()) {
    return dateStr < toLocalDateString(now)
      ? "Pickup date cannot be in the past. Please choose today or a later date."
      : "Pickup time cannot be in the past. Please choose a later time.";
  }
  if (expiryDate && when.getTime() >= new Date(expiryDate).getTime()) {
    return "Pickup cannot be scheduled after the food expiry time.";
  }
  return "";
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
