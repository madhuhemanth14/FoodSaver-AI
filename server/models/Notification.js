const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['registration', 'login', 'donation_created', 'donation_accepted', 'donation_rejected', 'analysis_completed', 'pickup_scheduled', 'pickup_confirmed', 'pickup_pickedup', 'pickup_delivered', 'donation_completed', 'expiry_warning', 'food_expired', 'system', 'admin'],
    default: 'system'
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  data: { type: mongoose.Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
