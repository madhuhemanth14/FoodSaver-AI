const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorPhone: {
      type: String,
      required: true,
      trim: true,
    },
    donorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    foodItems: {
      type: [String],
      required: true,
      default: [],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1,
    },
    quantityUnit: {
      type: String,
      default: "kg",
    },
    pickupAt: {
      type: Date,
    },
    pickupDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pickupTime: {
      type: String,
      required: true,
      default: "ASAP",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    donorAddress: {
      type: String,
      default: "",
    },
    deliveryAddress: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "Pending Confirmation",
        "Confirmed",
        "Picked Up",
        "Completed",
        "Cancelled",
        "Pending",
        "Requested",
        "Accepted",
        "On the Way",
        "Arrived",
        "Delivered",
      ],
      default: "Pending Confirmation",
    },
    confirmedAt: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    timeline: [
      {
        status: { type: String, required: true },
        note: { type: String, default: "" },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

pickupSchema.index({ partner: 1, status: 1 });
pickupSchema.index({ ngo: 1, status: 1 });
pickupSchema.index({ donation: 1 });
pickupSchema.index({ donor: 1 });

module.exports =
  mongoose.models.Pickup || mongoose.model("Pickup", pickupSchema);
