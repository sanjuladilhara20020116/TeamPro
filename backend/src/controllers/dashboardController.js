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

// Get start date of current week Monday
const getCurrentWeekStart = () => {
  const today = new Date();

  // JavaScript Sunday is 0, Monday is 1
  const day = today.getDay();

  // Calculate difference to Monday
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return monday;
};

// Get dashboard summary metrics for selected week
const getDashboardSummary = async (req, res) => {
  try {
    const { weekStart } = req.query;

    // If weekStart is not provided, use current week
    const selectedWeekStart = weekStart
      ? normalizeStartDate(weekStart)
      : getCurrentWeekStart();

    // Get all active team members
    const members = await User.find({
      role: "member",
      isActive: { $ne: false },
    }).select("_id name email");

    // Get reports created for selected week
    const reports = await WeeklyReport.find({
      weekStart: selectedWeekStart,
    });

    // Count submitted reports only
    const submittedReports = reports.filter(
      (report) => report.status === "submitted"
    );

    // Count unique members who submitted
    const submittedUserIds = new Set(
      submittedReports.map((report) => report.user.toString())
    );

    // Calculate pending count
    const pendingCount = members.length - submittedUserIds.size;

    // Calculate compliance percentage
    const complianceRate =
      members.length === 0
        ? 0
        : Math.round((submittedUserIds.size / members.length) * 100);

    // Count late submitted reports
    const lateCount = submittedReports.filter(
      (report) => report.isLate === true
    ).length;

    // Count all open blockers from selected week reports
    const openBlockersCount = reports.reduce((total, report) => {
      const openBlockers = report.blockers.filter(
        (blocker) => blocker.isOpen === true
      );

      return total + openBlockers.length;
    }, 0);

    return res.status(200).json({
      success: true,
      weekStart: selectedWeekStart,
      totalMembers: members.length,
      totalReportsSubmitted: submittedReports.length,
      pendingCount,
      lateCount,
      complianceRate,
      openBlockersCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

// Get completed tasks trend over time
const getTasksTrend = async (req, res) => {
  try {
    const { startDate, endDate, member, project } = req.query;

    // Build filter for submitted reports
    const filter = {
      status: "submitted",
    };

    // Optional member filter
    if (member) {
      filter.user = member;
    }

    // Optional project filter
    if (project) {
      filter.project = project;
    }

    // Optional date range filter
    if (startDate || endDate) {
      filter.weekStart = {};

      if (startDate) {
        filter.weekStart.$gte = normalizeStartDate(startDate);
      }

      if (endDate) {
        filter.weekStart.$lte = normalizeEndDate(endDate);
      }
    }

    const reports = await WeeklyReport.find(filter).sort({ weekStart: 1 });

    // Group report data by week
    const trendMap = {};

    reports.forEach((report) => {
      const weekKey = report.weekStart.toISOString().split("T")[0];

      if (!trendMap[weekKey]) {
        trendMap[weekKey] = {
          week: weekKey,
          completedTasks: 0,
          plannedTasks: 0,
          hoursWorked: 0,
          reportsCount: 0,
        };
      }

      trendMap[weekKey].completedTasks += report.tasksCompleted.length;
      trendMap[weekKey].plannedTasks += report.tasksPlanned.length;
      trendMap[weekKey].hoursWorked += report.hoursWorked || 0;
      trendMap[weekKey].reportsCount += 1;
    });

    const trend = Object.values(trendMap);

    return res.status(200).json({
      success: true,
      trend,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks trend",
      error: error.message,
    });
  }
};

// Get workload distribution by project
const getProjectWorkload = async (req, res) => {
  try {
    const { weekStart, startDate, endDate } = req.query;

    // Build filter for submitted reports
    const filter = {
      status: "submitted",
    };

    // Selected week filter
    if (weekStart) {
      filter.weekStart = normalizeStartDate(weekStart);
    }

    // Date range filter
    if (startDate || endDate) {
      filter.weekStart = {};

      if (startDate) {
        filter.weekStart.$gte = normalizeStartDate(startDate);
      }

      if (endDate) {
        filter.weekStart.$lte = normalizeEndDate(endDate);
      }
    }

    const reports = await WeeklyReport.find(filter).populate(
      "project",
      "name color description"
    );

    // Group workload by project
    const workloadMap = {};

    reports.forEach((report) => {
      if (!report.project) return;

      const projectId = report.project._id.toString();

      if (!workloadMap[projectId]) {
        workloadMap[projectId] = {
          projectId,
          projectName: report.project.name,
          color: report.project.color,
          reportsCount: 0,
          completedTasks: 0,
          plannedTasks: 0,
          hoursWorked: 0,
          openBlockers: 0,
        };
      }

      workloadMap[projectId].reportsCount += 1;
      workloadMap[projectId].completedTasks += report.tasksCompleted.length;
      workloadMap[projectId].plannedTasks += report.tasksPlanned.length;
      workloadMap[projectId].hoursWorked += report.hoursWorked || 0;

      const openBlockers = report.blockers.filter(
        (blocker) => blocker.isOpen === true
      );

      workloadMap[projectId].openBlockers += openBlockers.length;
    });

    const workload = Object.values(workloadMap);

    return res.status(200).json({
      success: true,
      workload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project workload",
      error: error.message,
    });
  }
};

// Get recent report activity feed
const getRecentActivity = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    // Get latest report activities
    const reports = await WeeklyReport.find()
      .populate("user", "name email role")
      .populate("project", "name color")
      .sort({ updatedAt: -1 })
      .limit(limit);

    // Format activity feed for frontend
    const activities = reports.map((report) => {
      return {
        id: report._id,
        user: report.user,
        project: report.project,
        weekStart: report.weekStart,
        weekEnd: report.weekEnd,
        status: report.status,
        isLate: report.isLate,
        submittedAt: report.submittedAt,
        updatedAt: report.updatedAt,
        message:
          report.status === "submitted"
            ? `${report.user.name} submitted a weekly report`
            : `${report.user.name} updated a draft report`,
      };
    });

    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
      error: error.message,
    });
  }
};

module.exports = {
  getTeamReports,
  getSubmissionStatus,
  getDashboardFilters,
  getDashboardSummary,
  getTasksTrend,
  getProjectWorkload,
  getRecentActivity,
};