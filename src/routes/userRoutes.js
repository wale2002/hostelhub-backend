const express = require("express");
const {
  getProfile,
  updateProfile,
  getLandlords,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
// Get landlords with search and pagination
router.get("/landlords", protect, getLandlords);
module.exports = router;
