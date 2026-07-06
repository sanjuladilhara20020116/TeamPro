const WeeklyReport = require("../models/WeeklyReport");
const User = require("../models/User");
const Project = require("../models/Project");

// Convert date into start of day
const normalizeStartDate = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Convert date into end of day
const normalizeEndDate = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(23, 59, 59, 999);
  return date;
};

// Get all team reports with manager filters
const getTeamReports = async (req, res) => {
  try {
    const { member, project, startDate, endDate, status, weekStart } = req.query;

    // Base filter for reports
    const filter = {};

    // Filter by team member
    if (member) {
      filter.user = member;
    }

    // Filter by project/category
    if (project) {
      filter.project = project;
    }

    // Filter by report status: draft or submitted
    if (status) {
      filter.status = status;
    }

    // Filter by one selected week
    if (weekStart) {
      filter.weekStart = normalizeStartDate(weekStart);
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.weekStart = {};

      if (startDate) {
        filter.weekStart.$gte = normalizeStartDate(startDate);
      }

      if (endDate) {
        filter.weekStart.$lte = normalizeEndDate(endDate);
      }
    }

    // Fetch reports with user and project details
    const reports = await WeeklyReport.find(filter)
      .populate("user", "name email role")
      .populate("project", "name color description")
      .sort({ weekStart: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team reports",
      error: error.message,
    });
  }
};

// Get submission status for selected week
const getSubmissionStatus = async (req, res) => {
  try {
    const { weekStart } = req.query;

    // Week start is required to calculate submitted, pending, and late users
    if (!weekStart) {
      return res.status(400).json({
        success: false,
        message: "weekStart query parameter is required",
      });
    }

    const selectedWeekStart = normalizeStartDate(weekStart);

    // Get all active team members
    const members = await User.find({
      role: "member",
      isActive: { $ne: false },
    }).select("name email role");

    // Get all submitted/draft reports for selected week
    const reports = await WeeklyReport.find({
      weekStart: selectedWeekStart,
    })
      .populate("user", "name email role")
      .populate("project", "name color");

    // Build status for every member
    const statusList = members.map((member) => {
      const memberReport = reports.find(
        (report) => report.user._id.toString() === member._id.toString()
      );

      // No report means pending
      if (!memberReport) {
        return {
          user: member,
          status: "pending",
          report: null,
          isLate: false,
        };
      }

      // Submitted report can be normal or late
      if (memberReport.status === "submitted") {
        return {
          user: member,
          status: memberReport.isLate ? "late" : "submitted",
          report: memberReport,
          isLate: memberReport.isLate,
        };
      }

      // Draft report is still pending from manager side
      return {
        user: member,
        status: "pending",
        report: memberReport,
        isLate: false,
      };
    });

    const submittedCount = statusList.filter(
      (item) => item.status === "submitted" || item.status === "late"
    ).length;

    const pendingCount = statusList.filter(
      (item) => item.status === "pending"
    ).length;

    const lateCount = statusList.filter(
      (item) => item.status === "late"
    ).length;

    return res.status(200).json({
      success: true,
      weekStart: selectedWeekStart,
      totalMembers: members.length,
      submittedCount,
      pendingCount,
      lateCount,
      statusList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission status",
      error: error.message,
    });
  }
};

// Get dropdown filter data for manager dashboard
const getDashboardFilters = async (req, res) => {
  try {
    // Get all active members for member filter
    const members = await User.find({
      role: "member",
      isActive: { $ne: false },
    })
      .select("name email role")
      .sort({ name: 1 });

    // Get all active projects for project filter
    const projects = await Project.find({
      isActive: true,
    })
      .select("name color description")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      members,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard filters",
      error: error.message,
    });
  }
};

module.exports = {
  getTeamReports,
  getSubmissionStatus,
  getDashboardFilters,
};