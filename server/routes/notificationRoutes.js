const express = require("express");

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(requireAuth);

// GET the authenticated user's own notifications
router.get("/", getNotifications);

// GET unread notification count for the authenticated user
router.get("/unread-count", getUnreadCount);

// PATCH one of the authenticated user's own notifications as read
router.patch("/:id/read", markAsRead);

// PATCH all of the authenticated user's own notifications as read
router.patch("/read-all", markAllAsRead);

// NOTE (removed): the old POST /test endpoint created a notification with a
// throwaway random userId and emailed an arbitrary address with no auth at
// all — a mock/demo endpoint with no place in production. Real notifications
// should be created by the actual events in donationController /
// pickupController, not a standalone test route.

module.exports = router;