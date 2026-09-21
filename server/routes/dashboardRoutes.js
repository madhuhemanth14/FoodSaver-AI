const express = require("express");

const {
    getDashboardStats,
    getDashboardOverview
} = require("../controllers/dashboardController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/stats", getDashboardStats);
router.get("/overview", getDashboardOverview);

module.exports = router;