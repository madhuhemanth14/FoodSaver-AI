const NGO = require("../models/NGO");
const mongoose = require("mongoose");

// CREATE NGO
const createNGO = async (req, res) => {
  try {
    const ngo = await NGO.create(req.body);

    res.status(201).json({
      success: true,
      message: "NGO created successfully",
      data: ngo,
    });
  } catch (error) {
    console.error("Create NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create NGO",
      error: error.message,
    });
  }
};

// GET ALL NGOs
const getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find();

    res.status(200).json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (error) {
    console.error("Get NGOs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch NGOs",
      error: error.message,
    });
  }
};
const getNearbyNGOs = async (req, res) => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    const radius = Number(req.query.radius || 10);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const ngos = await NGO.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000,
        },
      },
    });

    res.json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (error) {
    console.error("Nearby NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to find nearby NGOs",
      error: error.message,
    });
  }
};
// GET SINGLE NGO
const getNGOById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NGO.findById(id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ngo,
    });
  } catch (error) {
    console.error("Get NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch NGO",
      error: error.message,
    });
  }
};

// UPDATE NGO
const updateNGO = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NGO.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "NGO updated successfully",
      data: ngo,
    });
  } catch (error) {
    console.error("Update NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update NGO",
      error: error.message,
    });
  }
};

// DELETE NGO
const deleteNGO = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO ID",
      });
    }

    const ngo = await NGO.findByIdAndDelete(id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "NGO deleted successfully",
    });
  } catch (error) {
    console.error("Delete NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete NGO",
      error: error.message,
    });
  }
};
const searchNGOs = async (req, res) => {
  try {
    const searchTerm = req.query.search || "";

    const ngos = await NGO.find({
      $or: [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          address: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          city: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          state: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          acceptedFood: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      success: true,
      count: ngos.length,
      data: ngos,
    });
  } catch (error) {
    console.error("Search NGO error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search NGOs",
      error: error.message,
    });
  }
};
module.exports = {
  createNGO,
  getNGOs,
  getNGOById,
  updateNGO,
  deleteNGO,
  searchNGOs,
  getNearbyNGOs,
};

 