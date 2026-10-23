const express = require("express");

const {
  createNGO,
  getNGOs,
  getNGOById,
  updateNGO,
  deleteNGO,
  searchNGOs,
  getNearbyNGOs,
  getMyNGO,
  updateMyNGO,
  getNgoDashboard,
} = require("../controllers/ngoController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

// Browsing NGOs is open to any authenticated role (donors need this to
// pick where to send a donation).
router.get("/", getNGOs);
router.get("/search", searchNGOs);
router.get("/nearby", getNearbyNGOs);

// An NGO's own profile + dashboard — must come before "/:id" or Express
// would try to treat "me"/"dashboard" as an :id.
router.get("/me", requireRole("ngo"), getMyNGO);
router.patch("/me", requireRole("ngo"), updateMyNGO);
router.get("/dashboard", requireRole("ngo"), getNgoDashboard);

router.get("/:id", getNGOById);

// Creating/deleting NGO org listings is an admin operation. Updating one
// is allowed for its own linked NGO user too (ownership checked in the
// controller) or an admin.
router.post("/", requireRole("admin"), createNGO);
router.put("/:id", requireRole("ngo", "admin"), updateNGO);
router.delete("/:id", requireRole("admin"), deleteNGO);

module.exports = router;
