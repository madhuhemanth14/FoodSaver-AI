const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getDonorDashboard, getNGODashboard } = require('../controllers/dashboardController');

router.get('/donor', requireAuth, getDonorDashboard);
router.get('/ngo', requireAuth, requireRole('ngo'), getNGODashboard);

module.exports = router;
