const express = require("express");

const {
  getTeamReports,
  getSubmissionStatus,
  getDashboardFilters,
} = require("../controllers/dashboardController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All dashboard routes are manager/admin only
router.use(protect);
router.use(authorizeRoles("manager", "admin"));

// Get team reports with filters
router.get("/team-reports", getTeamReports);

// Get submitted, pending, and late status for selected week
router.get("/submission-status", getSubmissionStatus);

// Get members and projects for frontend filters
router.get("/filters", getDashboardFilters);

module.exports = router;