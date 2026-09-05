const cron = require("node-cron");
const Donation = require("../models/Donation");
const sendEmail = require("../services/emailService");
const {
  expiryReminderTemplate,
  expiredAdminAlertTemplate,
} = require("./emailTemplates");

const ACTIVE_STATUSES = ["Available", "Assigned", "Picked Up"];
const REMINDER_WINDOW_HOURS = 3; // send reminder when <= 3h (and > 0h) remain

function formatRemaining(ms) {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} minutes`;
  return `${hours}h ${minutes}m`;
}

async function checkExpiringDonations() {
  const now = new Date();

  let donations;
  try {
    donations = await Donation.find({
      status: { $in: ACTIVE_STATUSES },
      expiryDate: { $ne: null },
      $or: [{ expiryReminderSent: false }, { expiryAdminEmailSent: false }],
    });
  } catch (err) {
    console.error("Expiry scheduler: failed to query donations:", err.message);
    return;
  }

  for (const donation of donations) {
    try {
      const msRemaining = donation.expiryDate.getTime() - now.getTime();
      const hoursRemaining = msRemaining / (1000 * 60 * 60);

      // --- Reminder: 2-3 hours before expiry ---
      if (
        !donation.expiryReminderSent &&
        hoursRemaining > 0 &&
        hoursRemaining <= REMINDER_WINDOW_HOURS
      ) {
        const result = await sendEmail.sendTemplated({
          to: donation.donorEmail,
          ...expiryReminderTemplate({
            donationId: donation._id,
            foodItems: donation.foodItems.join(", "),
            quantity: `${donation.quantity} ${donation.quantityUnit}`,
            expiryTime: donation.expiryDate.toLocaleString(),
            remainingTime: formatRemaining(msRemaining),
            pickupStatus: donation.status,
          }),
        });

        if (result.success) {
          donation.expiryReminderSent = true;
          donation.expiryReminderSentAt = new Date();
        } else {
          console.error("Expiry reminder email failed:", result.error);
        }
        await donation.save();
        continue; // don't also fire the expired branch in the same pass
      }

      // --- Expired: admin alert ---
      if (!donation.expiryAdminEmailSent && msRemaining <= 0) {
        const result = await sendEmail.sendTemplated({
          to: process.env.EMAIL_USER,
          ...expiredAdminAlertTemplate({
            donationId: donation._id,
            donorName: donation.donorName,
            donorEmail: donation.donorEmail,
            foodItems: donation.foodItems.join(", "),
            quantity: `${donation.quantity} ${donation.quantityUnit}`,
            expiryTime: donation.expiryDate.toLocaleString(),
            status: donation.status,
            pickupInfo: donation.pickup ? String(donation.pickup) : "Not assigned",
          }),
        });

        if (result.success) {
          donation.expiryAdminEmailSent = true;
          donation.expiryAdminEmailSentAt = new Date();
          donation.status = "Expired";
        } else {
          console.error("Expired admin alert email failed:", result.error);
        }
        await donation.save();
      }
    } catch (perDonationErr) {
      // One bad donation record must never stop the rest of the batch,
      // and must never crash the server.
      console.error(
        `Expiry scheduler: error processing donation ${donation._id}:`,
        perDonationErr.message
      );
    }
  }
}

function startExpiryScheduler() {
  // Every 5 minutes.
  cron.schedule("*/5 * * * *", () => {
    checkExpiringDonations().catch((err) =>
      console.error("Expiry scheduler run failed:", err.message)
    );
  });
  console.log("Expiry scheduler started (runs every 5 minutes).");
}

module.exports = { startExpiryScheduler, checkExpiringDonations };
