const express = require("express");

const {
    getActivities,
    createTestActivity
} = require("../controllers/activityController");

const router = express.Router();

router.get("/", getActivities);

router.post("/test", createTestActivity);

module.exports = router;