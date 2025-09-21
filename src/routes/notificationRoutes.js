const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware"); // Add authentication middleware if needed

// Get notifications for the logged-in user
router.get("/", protect, notificationController.getNotifications);

// Create a new notification (for an admin or specific role, e.g., superagent)
router.post("/", protect, notificationController.createNotification);

module.exports = router;
