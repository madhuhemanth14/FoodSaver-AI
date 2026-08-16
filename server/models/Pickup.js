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
      default: [],
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    quantityUnit: {
      type: String,
      enum: ["kg", "litres", "packets", "items"],
      default: "kg",
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pickup", pickupSchema);