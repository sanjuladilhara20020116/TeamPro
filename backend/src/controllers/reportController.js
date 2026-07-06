const { validationResult } = require("express-validator");
const WeeklyReport = require("../models/WeeklyReport");
const Project = require("../models/Project");

// Convert date into clean start of day format
const normalizeDate = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Convert blockers into fixed database format
const formatBlockers = (blockers = []) => {
  return blockers
    .map((blocker) => {
      // Allow frontend to send blocker as simple string
      if (typeof blocker === "string") {
        return {
          text: blocker,
          isOpen: true,
        };
      }

      // Allow frontend to send blocker as object
      return {
        text: blocker.text,
        isOpen: blocker.isOpen !== undefined ? blocker.isOpen : true,
      };
    })
    .filter((blocker) => blocker.text && blocker.text.trim() !== "");
};

// Calculate whether report is late
const calculateLateStatus = (weekEnd, submittedAt) => {
  // Design decision: report deadline is weekEnd date at 6.00 PM
  const deadline = new Date(weekEnd);
  deadline.setHours(18, 0, 0, 0);

  return submittedAt > deadline;
};

// Create a new weekly report as draft
const createReport = async (req, res) => {
  try {
    // Read validation errors from route validators
    const errors = validationResult(req);

    // Stop request if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      project,
      weekStart,
      weekEnd,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
    } = req.body;

    // Check whether selected project exists
    const selectedProject = await Project.findOne({
      _id: project,
      isActive: true,
    });

    if (!selectedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const cleanWeekStart = normalizeDate(weekStart);
    const cleanWeekEnd = normalizeDate(weekEnd);

    // Week end date must be after week start date
    if (cleanWeekEnd < cleanWeekStart) {
      return res.status(400).json({
        success: false,
        message: "Week end date must be after week start date",
      });
    }

    // Prevent duplicate weekly report for same user and same week
    const existingReport = await WeeklyReport.findOne({
      user: req.user._id,
      weekStart: cleanWeekStart,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You already have a report for this week",
      });
    }

    // Create report as draft first
    const report = await WeeklyReport.create({
      user: req.user._id,
      project,
      weekStart: cleanWeekStart,
      weekEnd: cleanWeekEnd,
      tasksCompleted: tasksCompleted || [],
      tasksPlanned: tasksPlanned || [],
      blockers: formatBlockers(blockers || []),
      hoursWorked: hoursWorked || 0,
      notes: notes || "",
      status: "draft",
    });

    const populatedReport = await WeeklyReport.findById(report._id)
      .populate("user", "name email role")
      .populate("project", "name color description");

    return res.status(201).json({
      success: true,
      message: "Weekly report created successfully",
      report: populatedReport,
    });
  } catch (error) {
    // Handle duplicate index error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have a report for this week",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message,
    });
  }
};

// Get logged-in user's own report history
const getMyReports = async (req, res) => {
  try {
    const { status, project, startDate, endDate } = req.query;

    // Build filter only for logged-in user's reports
    const filter = {
      user: req.user._id,
    };

    // Optional status filter
    if (status) {
      filter.status = status;
    }

    // Optional project filter
    if (project) {
      filter.project = project;
    }

    // Optional date range filter
    if (startDate || endDate) {
      filter.weekStart = {};

      if (startDate) {
        filter.weekStart.$gte = normalizeDate(startDate);
      }

      if (endDate) {
        filter.weekStart.$lte = normalizeDate(endDate);
      }
    }

    // Get reports sorted by newest week first
    const reports = await WeeklyReport.find(filter)
      .populate("project", "name color description")
      .sort({ weekStart: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report history",
      error: error.message,
    });
  }
};

// Get one own report by id
const getMyReportById = async (req, res) => {
  try {
    // User can only read their own report
    const report = await WeeklyReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("user", "name email role")
      .populate("project", "name color description");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

// Update own weekly report
const updateReport = async (req, res) => {
  try {
    // Read validation errors from route validators
    const errors = validationResult(req);

    // Stop request if validation fails
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // User can only update their own report
    const report = await WeeklyReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const {
      project,
      weekStart,
      weekEnd,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
    } = req.body;

    // Validate selected project if project is changed
    if (project) {
      const selectedProject = await Project.findOne({
        _id: project,
        isActive: true,
      });

      if (!selectedProject) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      report.project = project;
    }

    // Update week start date if provided
    if (weekStart) {
      report.weekStart = normalizeDate(weekStart);
    }

    // Update week end date if provided
    if (weekEnd) {
      report.weekEnd = normalizeDate(weekEnd);
    }

    // Week end date must be after week start date
    if (report.weekEnd < report.weekStart) {
      return res.status(400).json({
        success: false,
        message: "Week end date must be after week start date",
      });
    }

    // Update fixed report fields
    if (tasksCompleted !== undefined) {
      report.tasksCompleted = tasksCompleted;
    }

    if (tasksPlanned !== undefined) {
      report.tasksPlanned = tasksPlanned;
    }

    if (blockers !== undefined) {
      report.blockers = formatBlockers(blockers);
    }

    if (hoursWorked !== undefined) {
      report.hoursWorked = hoursWorked;
    }

    if (notes !== undefined) {
      report.notes = notes;
    }

    // If already submitted, keep submitted status but recalculate late status
    if (report.status === "submitted" && report.submittedAt) {
      report.isLate = calculateLateStatus(report.weekEnd, report.submittedAt);
    }

    await report.save();

    const updatedReport = await WeeklyReport.findById(report._id)
      .populate("user", "name email role")
      .populate("project", "name color description");

    return res.status(200).json({
      success: true,
      message: "Weekly report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    // Handle duplicate week error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have a report for this week",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: error.message,
    });
  }
};

// Submit own weekly report
const submitReport = async (req, res) => {
  try {
    // User can only submit their own report
    const report = await WeeklyReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Stop if report was already submitted
    if (report.status === "submitted") {
      return res.status(400).json({
        success: false,
        message: "Report already submitted",
      });
    }

    // Required fields must be completed before submission
    if (!report.tasksCompleted || report.tasksCompleted.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one completed task before submission",
      });
    }

    if (!report.tasksPlanned || report.tasksPlanned.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one planned task before submission",
      });
    }

    const submittedAt = new Date();

    // Change status from draft to submitted
    report.status = "submitted";
    report.submittedAt = submittedAt;
    report.isLate = calculateLateStatus(report.weekEnd, submittedAt);

    await report.save();

    const submittedReport = await WeeklyReport.findById(report._id)
      .populate("user", "name email role")
      .populate("project", "name color description");

    return res.status(200).json({
      success: true,
      message: "Weekly report submitted successfully",
      report: submittedReport,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit report",
      error: error.message,
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getMyReportById,
  updateReport,
  submitReport,
};