const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeFood, getAnalysisHistory, getAnalysisById } = require('../controllers/analysisController');

router.post('/analyze', requireAuth, upload.single('image'), analyzeFood);
router.get('/', requireAuth, getAnalysisHistory);
router.get('/:id', requireAuth, getAnalysisById);

module.exports = router;
