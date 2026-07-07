const WeeklyReport = require("../models/WeeklyReport");
const User = require("../models/User");

// Convert date into start of day for filtering
const normalizeStartDate = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Convert date into end of day for filtering
const normalizeEndDate = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(23, 59, 59, 999);
  return date;
};

// Build report query based on manager request
const buildReportFilter = (filters = {}) => {
  const { weekStart, startDate, endDate, project, member } = filters;

  const filter = {
    status: "submitted",
  };

  // Filter by selected week
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

  // Filter by project if selected
  if (project) {
    filter.project = project;
  }

  // Filter by member if selected
  if (member) {
    filter.user = member;
  }

  return filter;
};

// Create a compact report context for AI
const buildReportsContext = (reports) => {
  if (!reports.length) {
    return "No submitted reports found for the selected filters.";
  }

  return reports
    .map((report, index) => {
      const blockers = report.blockers
        .filter((blocker) => blocker.isOpen)
        .map((blocker) => blocker.text);

      return `
Report ${index + 1}
Member: ${report.user?.name || "Unknown"}
Email: ${report.user?.email || "Unknown"}
Project: ${report.project?.name || "Unknown"}
Week: ${report.weekStart.toISOString().split("T")[0]} to ${
        report.weekEnd.toISOString().split("T")[0]
      }
Hours Worked: ${report.hoursWorked || 0}
Completed Tasks:
${report.tasksCompleted.map((task) => `- ${task}`).join("\n")}
Planned Tasks:
${report.tasksPlanned.map((task) => `- ${task}`).join("\n")}
Open Blockers:
${blockers.length ? blockers.map((b) => `- ${b}`).join("\n") : "- None"}
Notes:
${report.notes || "No notes"}
`;
    })
    .join("\n----------------------\n");
};

// Fallback summary when OpenAI key is missing
const buildLocalSummary = (reports) => {
  const totalReports = reports.length;

  const totalCompletedTasks = reports.reduce(
    (total, report) => total + report.tasksCompleted.length,
    0
  );

  const totalPlannedTasks = reports.reduce(
    (total, report) => total + report.tasksPlanned.length,
    0
  );

  const totalHours = reports.reduce(
    (total, report) => total + (report.hoursWorked || 0),
    0
  );

  const openBlockers = reports.flatMap((report) =>
    report.blockers
      .filter((blocker) => blocker.isOpen)
      .map((blocker) => ({
        member: report.user?.name || "Unknown",
        project: report.project?.name || "Unknown",
        blocker: blocker.text,
      }))
  );

  const projectMap = {};

  reports.forEach((report) => {
    const projectName = report.project?.name || "Unknown";

    if (!projectMap[projectName]) {
      projectMap[projectName] = {
        completedTasks: 0,
        hoursWorked: 0,
      };
    }

    projectMap[projectName].completedTasks += report.tasksCompleted.length;
    projectMap[projectName].hoursWorked += report.hoursWorked || 0;
  });

  const projectSummary = Object.entries(projectMap)
    .map(
      ([projectName, data]) =>
        `- ${projectName}: ${data.completedTasks} completed tasks, ${data.hoursWorked} hours`
    )
    .join("\n");

  const blockerSummary = openBlockers.length
    ? openBlockers
        .map(
          (item) =>
            `- ${item.member} on ${item.project}: ${item.blocker}`
        )
        .join("\n")
    : "- No open blockers found.";

  return `
AI key is not configured, so this is a local generated summary.

Team Summary:
- Total submitted reports: ${totalReports}
- Total completed tasks: ${totalCompletedTasks}
- Total planned tasks: ${totalPlannedTasks}
- Total hours worked: ${totalHours}
- Open blockers: ${openBlockers.length}

Project Workload:
${projectSummary || "- No project workload found."}

Open Blockers:
${blockerSummary}
`;
};

// Manager AI chat endpoint
const chatWithAssistant = async (req, res) => {
  try {
    const { question, filters } = req.body;

    // Validate question
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Get submitted reports based on selected filters
    const reportFilter = buildReportFilter(filters);

    const reports = await WeeklyReport.find(reportFilter)
      .populate("user", "name email role")
      .populate("project", "name color description")
      .sort({ weekStart: -1 })
      .limit(30);

    // Get active team member count for context
    const totalMembers = await User.countDocuments({
      role: "member",
      isActive: { $ne: false },
    });

    // Build clean report context
    const reportContext = buildReportsContext(reports);

    // If OpenAI API key is missing, return local summary
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        success: true,
        source: "local-summary",
        answer: buildLocalSummary(reports),
      });
    }

    // System instruction controls assistant behavior
    const systemPrompt = `
You are TeamPro AI Assistant for a weekly report dashboard.

Your job:
- Answer manager questions using only the provided report data.
- Summarize completed work, planned work, blockers, workload, and team activity.
- Mention when data is missing instead of guessing.
- Keep answers clear, professional, and concise.
- Do not expose passwords, secrets, tokens, or private system details.
- If the question is unrelated to reports or team activity, politely redirect to report-related help.

Privacy rule:
Only use the report context provided below. Do not claim access to data outside this context.
`;

    // User context sent to the AI model
    const userPrompt = `
Manager Question:
${question}

Dashboard Context:
Total active team members: ${totalMembers}
Submitted reports included in context: ${reports.length}

Report Data:
${reportContext}

Give a helpful answer for the manager.
`;

    // Call OpenAI Responses API from backend only
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    const data = await aiResponse.json();

    // Handle OpenAI API errors cleanly
    if (!aiResponse.ok) {
      return res.status(500).json({
        success: false,
        message: "AI assistant failed",
        error: data.error?.message || "Unknown AI API error",
      });
    }

    // Responses API usually returns text in output_text
    const answer =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "AI response received, but no text was returned.";

    return res.status(200).json({
      success: true,
      source: "openai",
      answer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process AI chat request",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAssistant,
};