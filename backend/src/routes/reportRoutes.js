const express = require("express");
const { body, param } = require("express-validator");

const {
  createReport,
  getMyReports,
  getMyReportById,
  updateReport,
  submitReport,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Validation for creating a weekly report
const createReportValidation = [
  body("project")
    .notEmpty()
    .withMessage("Project is required")
    .isMongoId()
    .withMessage("Project id is invalid"),

  body("weekStart")
    .notEmpty()
    .withMessage("Week start date is required")
    .isISO8601()
    .withMessage("Week start date must be a valid date"),

  body("weekEnd")
    .notEmpty()
    .withMessage("Week end date is required")
    .isISO8601()
    .withMessage("Week end date must be a valid date"),

  body("tasksCompleted")
    .optional()
    .isArray()
    .withMessage("Tasks completed must be an array"),

  body("tasksCompleted.*")
    .optional()
    .isString()
    .withMessage("Each completed task must be text"),

  body("tasksPlanned")
    .optional()
    .isArray()
    .withMessage("Tasks planned must be an array"),

  body("tasksPlanned.*")
    .optional()
    .isString()
    .withMessage("Each planned task must be text"),

  body("blockers")
    .optional()
    .isArray()
    .withMessage("Blockers must be an array"),

  body("hoursWorked")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hours worked must be a positive number"),

  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be text"),
];

// Validation for updating a weekly report
const updateReportValidation = [
  param("id").isMongoId().withMessage("Report id is invalid"),

  body("project")
    .optional()
    .isMongoId()
    .withMessage("Project id is invalid"),

  body("weekStart")
    .optional()
    .isISO8601()
    .withMessage("Week start date must be a valid date"),

  body("weekEnd")
    .optional()
    .isISO8601()
    .withMessage("Week end date must be a valid date"),

  body("tasksCompleted")
    .optional()
    .isArray()
    .withMessage("Tasks completed must be an array"),

  body("tasksPlanned")
    .optional()
    .isArray()
    .withMessage("Tasks planned must be an array"),

  body("blockers")
    .optional()
    .isArray()
    .withMessage("Blockers must be an array"),

  body("hoursWorked")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hours worked must be a positive number"),

  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be text"),
];

// Create weekly report
router.post("/", protect, createReportValidation, createReport);

// Get logged-in user's own report history
router.get("/my", protect, getMyReports);

// Get one own report by id
router.get(
  "/my/:id",
  protect,
  param("id").isMongoId().withMessage("Report id is invalid"),
  getMyReportById
);

// Update own weekly report
router.put("/:id", protect, updateReportValidation, updateReport);

// Submit own weekly report
router.patch(
  "/:id/submit",
  protect,
  param("id").isMongoId().withMessage("Report id is invalid"),
  submitReport
);

module.exports = router;