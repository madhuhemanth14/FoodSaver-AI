const express = require("express");

const { getActivities } = require("../controllers/activityController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", getActivities);

// NOTE (removed): the old POST /test endpoint created an activity record
// with a throwaway random userId and no auth — a mock/demo endpoint with
// no place in production. Real activity is now recorded by the actual
// events in donationController / pickupController / aiController.

module.exports = router;
