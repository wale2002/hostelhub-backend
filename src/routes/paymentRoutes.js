const express = require("express");
const {
  initPayment,
  verifyPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/init", protect, initPayment);
router.get("/verify", verifyPayment); // Webhook or callback

module.exports = router;
