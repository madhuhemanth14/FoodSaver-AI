const express = require("express");

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createTestNotification
} = require("../controllers/notificationController");
const router = express.Router();

// GET all notifications
router.get("/", getNotifications);

// GET unread notification count
router.get("/unread-count", getUnreadCount);

// PATCH one notification as read
router.patch("/:id/read", markAsRead);

// PATCH all notifications as read
router.patch("/read-all", markAllAsRead);

router.post("/test", createTestNotification);

module.exports = router;