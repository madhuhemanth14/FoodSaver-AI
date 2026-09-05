const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const admin = require('../controllers/adminController');

// All routes require admin role
router.use(requireAuth, requireRole('admin'));

router.get('/stats', admin.getDashboardStats);
router.get('/activity', admin.getRecentActivity);
router.get('/users', admin.getAllUsers);
router.get('/users/:id', admin.getUserById);
router.put('/users/:id', admin.updateUser);
router.put('/users/:id/toggle-active', admin.toggleUserActive);
router.put('/ngos/:id/verify', admin.verifyNGO);
router.get('/donations', admin.getAllDonationsAdmin);
router.get('/pickups', admin.getAllPickupsAdmin);
router.get('/analytics', admin.getAnalytics);
router.get('/reports', admin.getReports);

module.exports = router;
