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

// Only a donor can request a pickup for their own donation; the server
// derives all donor details from the authenticated user + the donation
// record, never from the request body (see createPickup).
router.post("/", requireRole("donor", "ngo"), createPickup);

router.get("/", getPickups); // filtered by role inside the controller
router.get("/:id", getPickupById); // ownership checked inside the controller

// Status changes are an NGO/admin operation, not something a donor drives.
router.put("/:id", requireRole("ngo", "admin"), updatePickup);
router.delete("/:id", requireRole("admin"), deletePickup);

module.exports = router;