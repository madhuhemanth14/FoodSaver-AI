const express = require("express");

const {
  createPickup,
  getPickups,
  getPickupById,
  updatePickup,
  deletePickup,
} = require("../controllers/pickupController");

const router = express.Router();

router.post("/", createPickup);

router.get("/", getPickups);

router.get("/:id", getPickupById);

router.put("/:id", updatePickup);

router.delete("/:id", deletePickup);

module.exports = router;