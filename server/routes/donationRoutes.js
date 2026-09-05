const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createDonation, getMyDonations, getAllDonations,
  getDonationById, updateDonation, cancelDonation
} = require('../controllers/donationController');

router.post('/', requireAuth, upload.single('image'), createDonation);
router.get('/', requireAuth, getMyDonations);
router.get('/all', requireAuth, requireRole('admin'), getAllDonations);
router.get('/:id', requireAuth, getDonationById);
router.put('/:id', requireAuth, upload.single('image'), updateDonation);
router.patch('/:id/cancel', requireAuth, cancelDonation);

module.exports = router;
