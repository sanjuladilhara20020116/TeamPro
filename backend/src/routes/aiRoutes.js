const express = require("express");

const { chatWithAssistant } = require("../controllers/aiController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// AI chat is manager/admin only
router.post(
  "/chat",
  protect,
  authorizeRoles("manager", "admin"),
  chatWithAssistant
);

module.exports = router;