const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification
} = require('../controllers/notificationController');

router.get('/', requireAuth, getMyNotifications);
router.get('/unread-count', requireAuth, getUnreadCount);
router.put('/read-all', requireAuth, markAllAsRead);
router.put('/:id/read', requireAuth, markAsRead);
router.delete('/:id', requireAuth, deleteNotification);

module.exports = router;
