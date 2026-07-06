const mongoose = require("mongoose");

const blockerSchema = new mongoose.Schema(
  {
    // challenge description
    text: {
      type: String,
      required: true,
    },

    // Manager dashboard uses this to count open challengers
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const weeklyReportSchema = new mongoose.Schema(
  {
    // Report owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Related project/category
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // Start date of the weekly report
    weekStart: {
      type: Date,
      required: true,
    },

    // End date of the weekly report
    weekEnd: {
      type: Date,
      required: true,
    },

    // completed tasks
    tasksCompleted: {
      type: [String],
      required: true,
      default: [],
    },

    // planned tasks
    tasksPlanned: {
      type: [String],
      required: true,
      default: [],
    },

    // challenges/blockers
    blockers: {
      type: [blockerSchema],
      default: [],
    },

    //  hours worked
    hoursWorked: {
      type: Number,
      default: 0,
    },

    // Optional field: notes or links
    notes: {
      type: String,
      default: "",
    },

    // Draft means editable, submitted means final submission
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },

    // Submission timestamp
    submittedAt: {
      type: Date,
      default: null,
    },

    // Late status is calculated when user submits after deadline
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent same user creating duplicate reports for same week and project
weeklyReportSchema.index(
  { user: 1, project: 1, weekStart: 1 },
  { unique: true }
);

module.exports = mongoose.model("WeeklyReport", weeklyReportSchema);