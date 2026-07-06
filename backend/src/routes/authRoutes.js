const express = require("express");
const { body } = require("express-validator");

const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register route with request validation
router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("role")
      .optional()
      .isIn(["member", "manager"])
      .withMessage("Role must be member or manager"),
  ],
  registerUser
);

// Login route with request validation
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  loginUser
);

// Get logged-in user route
router.get("/me", protect, getMe);

// Logout route
router.post("/logout", protect, logoutUser);

module.exports = router;