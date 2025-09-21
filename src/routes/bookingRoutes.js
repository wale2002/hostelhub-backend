// // const express = require("express");
// // const {
// //   createBooking,
// //   getBookings,
// //   confirmBooking,
// //   confirmMultipleBookings, // New controller for bulk confirmation
// // } = require("../controllers/bookingController");
// // const { protect, authorize } = require("../middleware/authMiddleware");

// // const router = express.Router();

// // // Create a booking
// // router.post("/", protect, createBooking);

// // // Get all bookings
// // router.get("/", protect, getBookings);

// // // Confirm a single booking (superagent only)
// // router.put(
// //   "/:bookingId/confirm",
// //   protect,
// //   authorize("superagent"),
// //   confirmBooking
// // );

// // // Confirm multiple bookings (superagent only)
// // router.put(
// //   "/confirm-multiple",
// //   protect,
// //   authorize("superagent"),
// //   confirmMultipleBookings
// // );

// // module.exports = router;

// // routes/bookings.js (assuming the file name based on context)
// const express = require("express");
// const {
//   createBooking,
//   getBookings,
//   confirmBooking,
//   confirmMultipleBookings,
//   getPendingBookings,
// } = require("../controllers/bookingController");
// const { protect, authorize } = require("../middleware/authMiddleware");

// const router = express.Router();

// // Create a booking
// router.post("/", protect, createBooking);

// // Get all bookings for the current user
// router.get("/", protect, getBookings);

// // Get all pending bookings for superagent
// router.get("/pending", protect, authorize("superagent"), getPendingBookings);

// // Confirm a single booking (superagent only)
// router.put(
//   "/:bookingId/confirm",
//   protect,
//   authorize("superagent"),
//   confirmBooking
// );

// // Confirm multiple bookings (superagent only)
// router.put(
//   "/confirm-multiple",
//   protect,
//   authorize("superagent"),
//   confirmMultipleBookings
// );

// module.exports = router;

// routes/bookings.js
const express = require("express");
const {
  createBooking,
  getBookings,
  confirmBooking,
  confirmMultipleBookings,
  getPendingBookings,
  getAllBookingsForSuperagent,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a booking (Student)
router.post("/", protect, createBooking);

// Get all bookings for the current user (Student)
router.get("/", protect, getBookings);

// Get pending bookings for superagent
router.get("/pending", protect, authorize("superagent"), getPendingBookings);

// Get all bookings for superagent (dashboard view)
router.get(
  "/all",
  protect,
  authorize("superagent"),
  getAllBookingsForSuperagent
);

// Confirm a single booking (superagent only)
router.put(
  "/:bookingId/confirm",
  protect,
  authorize("superagent"),
  confirmBooking
);

// Confirm multiple bookings (superagent only)
router.put(
  "/confirm-multiple",
  protect,
  authorize("superagent"),
  confirmMultipleBookings
);

module.exports = router;
