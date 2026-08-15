const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true,
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

    foodItems: {
      type: [String],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Picked Up",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pickup", pickupSchema);