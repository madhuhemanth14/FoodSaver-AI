const express = require("express");
const multer = require("multer");
const { analyzeFood, getHistory, getHistoryById } = require("../controllers/aiController");
const { requireAuth } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const router = express.Router();

router.use(requireAuth);

router.post("/analyze", upload.single("image"), analyzeFood);
router.get("/history", getHistory);
router.get("/history/:id", getHistoryById);

module.exports = router;
