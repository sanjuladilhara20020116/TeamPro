const express = require("express");
const { body } = require("express-validator");

const {
  getProfile,
  updateProfile,
  changePassword,
  removeAccount,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get own profile
router.get("/profile", protect, getProfile);

// Update own profile
router.put(
  "/profile",
  protect,
  [
    body("name")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .optional()
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio cannot be more than 500 characters"),
  ],
  updateProfile
);

// Change password
router.put("/change-password", protect, changePassword);

// Remove account
router.delete("/profile", protect, removeAccount);

module.exports = router;