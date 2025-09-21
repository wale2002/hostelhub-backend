const express = require("express");
const {
  register,
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");
const { registerSchema, loginSchema } = require("../utils/validators");
const validationMiddleware = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/register", validationMiddleware(registerSchema), register);
router.post("/login", validationMiddleware(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

module.exports = router;
