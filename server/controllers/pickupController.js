const mongoose = require("mongoose");
const Pickup = require("../models/Pickup");
const NGO = require("../models/NGO");

// CREATE PICKUP
const createPickup = async (req, res) => {
  try {
    const {
      ngo,
      donorName,
      donorPhone,
      foodItems,
      quantity,
      pickupDate,
      pickupTime,
      address,
      notes,
    } = req.body;

    if (!ngo) {
      return res.status(400).json({
        success: false,
        message: "NGO is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(ngo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngoExists = await NGO.findById(ngo);

    if (!ngoExists) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    const pickup = await Pickup.create({
      ngo,
      donorName,
      donorPhone,
      foodItems,
      quantity,
      pickupDate,
      pickupTime,
      address,
      notes,
    });

    const populatedPickup = await Pickup.findById(pickup._id).populate(
      "ngo"
    );

    res.status(201).json({
      success: true,
      message: "Pickup created successfully",
      data: populatedPickup,
    });
  } catch (error) {
    console.error("Create pickup error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create pickup",
      error: error.message,
    });
  }
};

// GET ALL PICKUPS
const getPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate("ngo")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    console.error("Get pickups error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pickups",
      error: error.message,
    });
  }
};

// GET PICKUP BY ID
const getPickupById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID",
      });
    }

    const pickup = await Pickup.findById(id).populate("ngo");

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    res.json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    console.error("Get pickup error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pickup",
      error: error.message,
    });
  }
};

// UPDATE PICKUP
const updatePickup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID",
      });
    }

    const pickup = await Pickup.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("ngo");

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    res.json({
      success: true,
      message: "Pickup updated successfully",
      data: pickup,
    });
  } catch (error) {
    console.error("Update pickup error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update pickup",
      error: error.message,
    });
  }
};

// DELETE PICKUP
const deletePickup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID",
      });
    }

    const pickup = await Pickup.findByIdAndDelete(id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup not found",
      });
    }

    res.json({
      success: true,
      message: "Pickup deleted successfully",
    });
  } catch (error) {
    console.error("Delete pickup error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete pickup",
      error: error.message,
    });
  }
};

module.exports = {
  createPickup,
  getPickups,
  getPickupById,
  updatePickup,
  deletePickup,
};