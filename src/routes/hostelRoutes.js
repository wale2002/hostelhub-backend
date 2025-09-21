// // routes/hostelRoutes.js
// const express = require("express");
// const router = express.Router();
// const {
//   createHostel,
//   getHostels,
//   updateHostel,
//   deleteHostel,
//   getHostel,
//   getHostelsByEstate,
// } = require("../controllers/hostelController");
// const { protect, authorize } = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");

// router.post(
//   "/",
//   protect,
//   authorize("landlord", "superagent"),
//   upload,
//   createHostel
// );
// router.get("/", getHostels);
// // Route to get hostels by estate ID
// router.get("/:estateId", getHostelsByEstate);
// router.get("/:id", getHostel);
// router.put(
//   "/:id",
//   protect,
//   authorize("landlord", "superagent"),
//   upload,
//   updateHostel
// );
// router.delete(
//   "/:id",
//   protect,
//   authorize("landlord", "superagent"),
//   deleteHostel
// );

// module.exports = router;

// routes/hostelRoutes.js
const express = require("express");
const router = express.Router();
const {
  createHostel,
  getHostels,
  updateHostel,
  deleteHostel,
  getHostel,
  getHostelsByEstate,
} = require("../controllers/hostelController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Create a hostel
router.post(
  "/",
  protect,
  authorize("landlord", "superagent"),
  upload,
  createHostel
);

// Get all hostels
router.get("/", getHostels);

// Get hostels by estate ID (array of hostels)
router.get("/estate/:estateId", getHostelsByEstate);

// Get single hostel by hostel ID (single object)
router.get("/:id", getHostel);

// Update hostel
router.put(
  "/:id",
  protect,
  authorize("landlord", "superagent"),
  upload,
  updateHostel
);

// Delete hostel
router.delete(
  "/:id",
  protect,
  authorize("landlord", "superagent"),
  deleteHostel
);

module.exports = router;
