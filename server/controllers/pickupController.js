const mongoose = require("mongoose");
const Pickup = require("../models/Pickup");


// CREATE PICKUP
const createPickup = async (req, res) => {
  try {
    const pickup = await Pickup.create(req.body);

    const populatedPickup = await Pickup.findById(pickup._id)
      .populate("ngo", "name shortName address phone");

    res.status(201).json({
      success: true,
      message: "Pickup created successfully",
      data: populatedPickup,
    });
  } catch (error) {
    console.error("Create pickup error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL PICKUPS
const getPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate("ngo", "name shortName address phone")
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
      message: error.message,
    });
  }
};


// GET ONE PICKUP
const getPickupById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup ID",
      });
    }

    const pickup = await Pickup.findById(id)
      .populate("ngo", "name shortName address phone");

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
      message: error.message,
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
    ).populate("ngo", "name shortName address phone");

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

    res.status(400).json({
      success: false,
      message: error.message,
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
      message: error.message,
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