// Date/time helpers for pickup scheduling. Everything here works on real
// instants (Date objects) and always reads the CURRENT time from the clock
// at call time — nothing is hard-coded.

// Timezone used to interpret a bare "YYYY-MM-DD" + "HH:mm" pair when the
// client does not send an exact instant. Configure with APP_TIMEZONE.
const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";

function tzOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// "2026-10-02" + "19:00" in `timeZone` -> the exact UTC instant (or null).
function zonedToDate(dateStr, timeStr, timeZone = APP_TIMEZONE) {
  const d = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr || ""));
  const t = /^(\d{1,2}):(\d{2})/.exec(String(timeStr || ""));
  if (!d || !t) return null;
  const [y, mo, da] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const [h, mi] = [Number(t[1]), Number(t[2])];
  if (mo < 1 || mo > 12 || da < 1 || da > 31 || h > 23 || mi > 59) return null;
  const guess = Date.UTC(y, mo - 1, da, h, mi);
  let result = guess - tzOffsetMs(new Date(guess), timeZone);
  result = guess - tzOffsetMs(new Date(result), timeZone); // settle across DST edges
  const out = new Date(result);
  return Number.isNaN(out.getTime()) ? null : out;
}

// The exact pickup instant: prefer the client's ISO instant (computed in the
// user's own timezone), otherwise interpret date + time in APP_TIMEZONE.
function resolvePickupInstant({ pickupAt, pickupDate, pickupTime }) {
  if (pickupAt) {
    const d = new Date(pickupAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return zonedToDate(pickupDate, pickupTime);
}

// Returns an error message, or "" when the pickup instant is acceptable.
// Date and time are validated together, as ONE instant, against the clock.
function validatePickupInstant(pickupInstant, expiryDate, now = new Date()) {
  if (!pickupInstant) return "A valid pickup date and time are required.";
  if (pickupInstant.getTime() <= now.getTime()) {
    return "Pickup date and time cannot be in the past. Please choose a future time.";
  }
  if (expiryDate && pickupInstant.getTime() >= new Date(expiryDate).getTime()) {
    return "Pickup cannot be scheduled after the food expiry time.";
  }
  return "";
}

module.exports = { APP_TIMEZONE, zonedToDate, resolvePickupInstant, validatePickupInstant };
