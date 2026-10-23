const express = require("express");

const {
  createPickup,
  getPickups,
  getPickupById,
  updatePickup,
  deletePickup,
} = require("../controllers/pickupController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

// The NGO that accepted a donation schedules its pickup; the server derives
// all donor details from the donation record, never from the request body
// (see createPickup). Donors get a clear 403 explaining the new flow.
router.post("/", requireRole("donor", "ngo"), createPickup);

router.get("/", getPickups); // filtered by role inside the controller
router.get("/:id", getPickupById); // ownership checked inside the controller

// Status changes: the donor confirms; the NGO/admin picks up / completes.
// The per-transition role check lives in updatePickup (donors can only
// confirm — they can never mark Picked Up or Completed).
router.put("/:id", requireRole("donor", "ngo", "admin"), updatePickup);
router.delete("/:id", requireRole("admin"), deletePickup);

module.exports = router;