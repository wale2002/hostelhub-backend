// routes/estateRoutes.js
const express = require("express");
const router = express.Router();
const {
  createEstate,
  getEstates,
  updateEstate,
  deleteEstate,
} = require("../controllers/estateController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  protect,
  authorize("landlord", "superagent"),
  upload,
  createEstate
);
router.get("/", getEstates);
router.put(
  "/:id",
  protect,
  authorize("landlord", "superagent"),
  upload,
  updateEstate
);
router.delete(
  "/:id",
  protect,
  authorize("landlord", "superagent"),
  deleteEstate
);

module.exports = router;
