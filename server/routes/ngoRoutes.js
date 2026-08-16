const express = require("express");

const {
  createNGO,
  getNGOs,
  getNGOById,
  updateNGO,
  deleteNGO,
  searchNGOs,
  getNearbyNGOs,
} = require("../controllers/ngoController");
const router = express.Router();

// POST /api/ngos
router.post("/", createNGO);

// GET /api/ngos
router.get("/", getNGOs);
router.get("/search", searchNGOs);
router.get("/nearby", getNearbyNGOs);
// GET /api/ngos/:id
router.get("/:id", getNGOById);

// PUT /api/ngos/:id
router.put("/:id", updateNGO);

// DELETE /api/ngos/:id
router.delete("/:id", deleteNGO);

module.exports = router;