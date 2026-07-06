const express = require("express");

const {
  getTeamReports,
  getSubmissionStatus,
  getDashboardFilters,
  getDashboardSummary,
  getTasksTrend,
  getProjectWorkload,
  getRecentActivity,
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

// Get manager dashboard summary cards
router.get("/summary", getDashboardSummary);

// Get task completed trend chart data
router.get("/tasks-trend", getTasksTrend);

// Get workload distribution chart data
router.get("/project-workload", getProjectWorkload);

// Get recent report activity feed
router.get("/recent-activity", getRecentActivity);

module.exports = router;