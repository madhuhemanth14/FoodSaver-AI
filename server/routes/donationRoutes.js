const express = require("express");
const {
  createDonation,
  getDonations,
  getDonationById,
  submitAnalysis,
  cancelDonation,
  acceptDonation,
  rejectDonation,
} = require("../controllers/donationController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Every donation route requires a logged-in user. Identity (who the donor
// is, what they're allowed to see) always comes from req.user, never from
// the request body or query string.
router.use(requireAuth);

router.post("/", requireRole("donor"), createDonation);
router.get("/", getDonations); // filtered by role inside the controller
router.get("/:id", getDonationById); // ownership checked inside the controller
router.patch("/:id/analysis", submitAnalysis); // ownership checked inside the controller
router.patch("/:id/cancel", requireRole("donor"), cancelDonation);

// NGO workflow: accept an available donation, or release it again before a
// pickup is scheduled. Scheduling itself is POST /api/pickups.
router.patch("/:id/accept", requireRole("ngo"), acceptDonation);
router.patch("/:id/reject", requireRole("ngo"), rejectDonation);

module.exports = router;
