const Donation = require('../models/Donation');

/**
 * Create a new donation
 * @route POST /api/donations
 */
exports.createDonation = async (req, res) => {
  try {
    const donorId = req.user._id;
    const donationData = { ...req.body, donor: donorId };

    if (req.file) {
      donationData.image = `/uploads/${req.file.filename}`;
    }

    const donation = new Donation(donationData);
    await donation.save();

    await donation.populate('donor', 'name email');
    if (donation.ngo) {
      await donation.populate('ngo');
    }
    if (donation.aiAnalysis) {
      await donation.populate('aiAnalysis');
    }

    return res.status(201).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error in createDonation:', error);
    return res.status(500).json({ success: false, message: 'Server error creating donation' });
  }
};

/**
 * Get all donations for the current donor user
 * @route GET /api/donations
 */
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .populate('ngo', 'name shortName')
      .populate('aiAnalysis');

    return res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Error in getMyDonations:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving donations' });
  }
};

/**
 * Get all donations (Admin only)
 * @route GET /api/donations/all
 */
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate('donor', 'name email')
      .populate('ngo', 'name shortName');

    return res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Error in getAllDonations:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving all donations' });
  }
};

/**
 * Get a specific donation by ID
 * @route GET /api/donations/:id
 */
exports.getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Quick validation for valid ObjectId length (not perfect but prevents cast errors)
    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid donation ID format' });
    }

    const donation = await Donation.findById(id)
      .populate('donor')
      .populate('ngo')
      .populate('aiAnalysis')
      .populate('pickup');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check ownership or admin
    if (donation.donor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this donation' });
    }

    return res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error in getDonationById:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving donation' });
  }
};

/**
 * Update a donation
 * @route PUT /api/donations/:id
 */
exports.updateDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid donation ID format' });
    }

    let donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check ownership
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this donation' });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Explicitly prevent updating certain fields if needed
    delete updateData.donor;
    delete updateData.status;

    donation = await Donation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error in updateDonation:', error);
    return res.status(500).json({ success: false, message: 'Server error updating donation' });
  }
};

/**
 * Cancel a donation
 * @route PATCH /api/donations/:id/cancel
 */
exports.cancelDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid donation ID format' });
    }

    let donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check ownership
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this donation' });
    }

    // Check if cancellation is allowed based on status
    const allowedStatuses = ['Draft', 'Pending', 'Analyzed', 'Available'];
    if (!allowedStatuses.includes(donation.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel donation with status: ${donation.status}` 
      });
    }

    donation.status = 'Cancelled';
    await donation.save();

    return res.status(200).json({
      success: true,
      data: donation
    });
  } catch (error) {
    console.error('Error in cancelDonation:', error);
    return res.status(500).json({ success: false, message: 'Server error cancelling donation' });
  }
};
