const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { secret, expiry } = require("../config/jwt");
const { sendEmail } = require("../services/emailService");

exports.register = [
  // Input validation
  body("name").notEmpty().trim().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().trim().withMessage("Password is required"),
  body("role")
    .notEmpty()
    .trim()
    .withMessage("Role is required")
    .isIn(["student", "landlord", "superagent"])
    .withMessage("Invalid role. Must be one of: student, landlord, superagent"),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ msg: "Invalid input", errors: errors.array() });
      }

      const { name, email, password, role } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(409).json({ msg: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      user = new User({ name, email, password: hashedPassword, role });
      await user.save();

      // Send confirmation email
      // await sendEmail(email, "Welcome!", "Thank you for registering.");

      // Send response
      res.status(201).json({ msg: "User registered" });
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(400).json({
          msg: Object.values(err.errors)
            .map((e) => e.message)
            .join(", "),
        });
      }
      if (err.code === 11000) {
        return res.status(409).json({ msg: "User already exists" });
      }
      next(err);
    }
  },
];

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id, role: user.role }, secret, {
//       expiresIn: expiry,
//     });
//     res.json({ token });
//   } catch (err) {
//     next(err);
//   }
// };

exports.login = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().trim(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ msg: "Invalid input", errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({ msg: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        secret, // Use the same secret as protect middleware
        { expiresIn: expiry || "1d" }
      );

      console.log("Login User Role:", user.role); // Debug
      console.log("Token Payload:", { id: user._id, role: user.role }); // Debug

      res.json({
        token,
        user: { id: user._id, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("Login error:", err);
      next(err);
    }
  },
];

exports.refreshToken = (req, res) => {
  // Implement refresh logic if needed (e.g., using refresh tokens)
  res.json({ msg: "Token refreshed" });
};
exports.logout = (req, res) => {
  res.json({ msg: "Successfully logged out" });
};
