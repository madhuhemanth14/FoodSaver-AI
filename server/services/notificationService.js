const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {string} userId - User's MongoDB _id
 * @param {string} type - notification type enum value
 * @param {string} title - notification title
 * @param {string} message - notification message
 * @param {object} data - optional additional data
 */
async function createNotification(userId, type, title, message, data = null) {
  try {
    await Notification.create({ user: userId, type, title, message, data });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    // Don't throw — notification failures should not break the main operation
  }
}

// Convenience helpers
async function notifyDonationCreated(userId, donationName) {
  await createNotification(userId, 'donation_created', 'Donation Created', 
    `Your donation "${donationName}" has been listed successfully.`);
}

async function notifyAnalysisCompleted(userId, foodType) {
  await createNotification(userId, 'analysis_completed', 'Analysis Complete',
    `AI analysis for "${foodType}" has been completed.`);
}

async function notifyPickupScheduled(userId, ngoName) {
  await createNotification(userId, 'pickup_scheduled', 'Pickup Scheduled',
    `A pickup has been scheduled with ${ngoName}.`);
}

async function notifyPickupCompleted(userId) {
  await createNotification(userId, 'donation_completed', 'Donation Completed',
    'Your food donation has been successfully delivered!');
}

async function notifyWelcome(userId) {
  await createNotification(userId, 'registration', 'Welcome to FoodSaver AI',
    'Your account has been created. Start donating food today!');
}

module.exports = {
  createNotification,
  notifyDonationCreated,
  notifyAnalysisCompleted,
  notifyPickupScheduled,
  notifyPickupCompleted,
  notifyWelcome
};
