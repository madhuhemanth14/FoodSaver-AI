const express = require('express');
const router = express.Router();

const { requireAuth, requireRole } = require('../middleware/auth');

const {
  getDonorDashboard,
  getNGODashboard,
  getDashboardStats
} = require('../controllers/dashboardController');

router.get('/donor', requireAuth, getDonorDashboard);
router.get('/ngo', requireAuth, requireRole('ngo'), getNGODashboard);
router.get('/stats', getDashboardStats);

module.exports = router;