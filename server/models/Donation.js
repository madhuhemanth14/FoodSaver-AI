const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true, trim: true },
  foodType: { type: String, trim: true },
  category: { type: String, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  quantityUnit: { type: String, enum: ['kg', 'litres', 'packets', 'items', 'plates', 'trays'], default: 'kg' },
  image: { type: String, default: '' },
  description: { type: String, trim: true, default: '' },
  preparedAt: { type: Date },
  expiryDate: { type: Date },
  expiryEstimate: { type: String },
  qualityStatus: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Expired'], default: 'Good' },
  aiAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: 'AIAnalysis' },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  pickup: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup' },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Analyzed', 'Available', 'Assigned', 'PickupScheduled', 'PickedUp', 'Delivered', 'Cancelled', 'Expired'],
    default: 'Available'
  },
  location: { type: String, trim: true }
}, { timestamps: true });

donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
