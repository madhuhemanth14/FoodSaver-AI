const express = require("express");
const {
  getDashboard,
  getActivity,
  getUsers,
  getUserById,
  updateUserStatus,
  getNGOs,
  updateNGOStatus,
  getDonations,
  getAnalytics,
  getReports,
} = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Every admin route requires a real, DB-verified admin — never trusted
// from the frontend route guard alone.
router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", getDashboard);
router.get("/activity", getActivity);
router.get("/analytics", getAnalytics);
router.get("/reports", getReports);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);

router.get("/ngos", getNGOs);
router.patch("/ngos/:id/status", updateNGOStatus);

router.get("/donations", getDonations);

module.exports = router;
