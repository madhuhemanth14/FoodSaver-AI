const Donation = require("../models/Donation");

// Donations nobody has scheduled yet. Once a pickup is scheduled the donation
// is Closed and is no longer swept — a pickup is already arranged for it.
const UNCLAIMED = ["Available", "Accepted"];

// Bulk sweep: any unclaimed donation whose expiry has passed becomes Expired.
// Called from every donation/NGO read and write path (and the cron job), so
// expiry never depends on a frontend timer. Records are kept for history.
async function expireOverdueDonations(now = new Date()) {
  return Donation.updateMany(
    { status: { $in: UNCLAIMED }, expiryDate: { $ne: null, $lte: now } },
    { $set: { status: "Expired", ngo: null } }
  );
}

// Single-document check; returns true if the donation is expired.
async function expireIfOverdue(donation, now = new Date()) {
  if (!donation) return false;
  if (
    UNCLAIMED.includes(donation.status) &&
    donation.expiryDate &&
    donation.expiryDate.getTime() <= now.getTime()
  ) {
    donation.status = "Expired";
    donation.ngo = null;
    await donation.save();
  }
  return donation.status === "Expired";
}

module.exports = { expireOverdueDonations, expireIfOverdue, UNCLAIMED };
