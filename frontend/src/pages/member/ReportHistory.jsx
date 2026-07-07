import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  FolderKanban,
  Loader2,
  Save,
  Send,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function ReportHistory() {
  // Store logged-in user's reports
  const [reports, setReports] = useState([]);

  // Store project list for edit dropdown
  const [projects, setProjects] = useState([]);

  // Loading state for page
  const [loading, setLoading] = useState(false);

  // Selected report for view/edit modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Modal mode can be view or edit
  const [modalMode, setModalMode] = useState("view");

  // Loading states for update and submit buttons
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    project: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    project: "",
    weekStart: "",
    weekEnd: "",
    tasksCompleted: "",
    tasksPlanned: "",
    blockers: "",
    hoursWorked: "",
    notes: "",
  });

  // Format backend date to yyyy-mm-dd for input fields
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().split("T")[0];
  };

  // Format date for card display
  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Convert textarea lines into array for backend
  const convertLinesToArray = (text) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
  };

  // Convert backend array into textarea text
  const convertArrayToText = (array = []) => {
    return array.join("\n");
  };

  // Convert backend blockers into textarea text
  const convertBlockersToText = (blockers = []) => {
    return blockers.map((blocker) => blocker.text).join("\n");
  };

  // Fetch active projects
  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");

      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      toast.error("Failed to load projects");
    }
  };

  // Fetch logged-in user's own reports
  const fetchReports = async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();

      // Add status filter if selected
      if (filters.status) {
        queryParams.append("status", filters.status);
      }

      // Add project filter if selected
      if (filters.project) {
        queryParams.append("project", filters.project);
      }

      const response = await api.get(`/reports/my?${queryParams.toString()}`);

      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      toast.error("Failed to load report history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  // Open report in view mode
  const handleView = (report) => {
    setSelectedReport(report);
    setModalMode("view");
  };

  // Open report in edit mode and fill form
  const handleEdit = (report) => {
    setSelectedReport(report);
    setModalMode("edit");

    setEditForm({
      project: report.project?._id || "",
      weekStart: formatDateForInput(report.weekStart),
      weekEnd: formatDateForInput(report.weekEnd),
      tasksCompleted: convertArrayToText(report.tasksCompleted),
      tasksPlanned: convertArrayToText(report.tasksPlanned),
      blockers: convertBlockersToText(report.blockers),
      hoursWorked: report.hoursWorked || "",
      notes: report.notes || "",
    });
  };

  // Close modal
  const closeModal = () => {
    setSelectedReport(null);
    setModalMode("view");
  };

  // Update edit form values
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // Build update payload for backend
  const buildUpdatePayload = () => {
    return {
      project: editForm.project,
      weekStart: editForm.weekStart,
      weekEnd: editForm.weekEnd,
      tasksCompleted: convertLinesToArray(editForm.tasksCompleted),
      tasksPlanned: convertLinesToArray(editForm.tasksPlanned),
      blockers: convertLinesToArray(editForm.blockers).map((blocker) => ({
        text: blocker,
        isOpen: true,
      })),
      hoursWorked: Number(editForm.hoursWorked) || 0,
      notes: editForm.notes,
    };
  };

  // Validate edit form before updating
  const validateEditForm = () => {
    if (!editForm.project) {
      toast.error("Please select a project");
      return false;
    }

    if (!editForm.weekStart || !editForm.weekEnd) {
      toast.error("Please select week start and week end dates");
      return false;
    }

    if (new Date(editForm.weekEnd) < new Date(editForm.weekStart)) {
      toast.error("Week end date must be after week start date");
      return false;
    }

    return true;
  };

  // Update selected report
  const handleUpdateReport = async () => {
    if (!validateEditForm()) return;

    try {
      setUpdating(true);

      const payload = buildUpdatePayload();

      const response = await api.put(`/reports/${selectedReport._id}`, payload);

      if (response.data.success) {
        toast.success("Report updated successfully");

        // Refresh list after update
        await fetchReports();

        // Update selected report with latest response
        setSelectedReport(response.data.report);
        setModalMode("view");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update report");
    } finally {
      setUpdating(false);
    }
  };

  // Submit draft report
  const handleSubmitReport = async (reportId) => {
    try {
      setSubmitting(true);

      const response = await api.patch(`/reports/${reportId}/submit`);

      if (response.data.success) {
        toast.success("Report submitted successfully");

        // Refresh reports after submission
        await fetchReports();

        // Close modal after submit
        closeModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  // Status badge design
  const StatusBadge = ({ report }) => {
    if (report.status === "submitted") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-xl ${
            report.isLate
              ? "border-red-200 bg-red-50/80 text-red-700"
              : "border-emerald-200 bg-emerald-50/80 text-emerald-700"
          }`}
        >
          <CheckCircle2 size={14} />
          {report.isLate ? "Late" : "Submitted"}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-3.5 py-1.5 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur-xl">
        <Clock size={14} />
        Draft
      </span>
    );
  };

  return (
    <DashboardLayout
      title="Report History"
      subtitle="View, edit, and submit your weekly reports."
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-slate-50 via-indigo-50/70 to-cyan-50/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/4 h-52 w-52 rounded-full bg-fuchsia-200/30 blur-3xl" />

        <div className="relative">
          {/* Filter section */}
          <div className="mb-6 rounded-[1.7rem] border border-white/70 bg-white/65 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                  Search Panel
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">
                  Filter your weekly reports
                </h3>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
                <FileText size={14} />
                {reports.length} Reports
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Filter by Status
                </label>

                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">All Reports</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Filter by Project
                </label>

                <select
                  value={filters.project}
                  onChange={(e) =>
                    setFilters({ ...filters, project: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">All Projects</option>

                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: "", project: "" })}
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Report list */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-[1.7rem] border border-white/70 bg-white/70 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 shadow-inner">
                  <Loader2
                    className="animate-spin text-indigo-600"
                    size={34}
                  />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading your reports...
                </p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-[1.7rem] border border-white/70 bg-white/70 p-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-cyan-100 shadow-inner">
                <FileText className="text-indigo-500" size={46} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                No reports found
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first weekly report from the Create Report page.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="group overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/70 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/85 hover:shadow-[0_26px_70px_rgba(79,70,229,0.16)] sm:p-6"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-fuchsia-500 opacity-0 transition group-hover:opacity-100" />

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge report={report} />

                        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-xl">
                          <FolderKanban size={14} />
                          {report.project?.name || "No Project"}
                        </span>
                      </div>

                      <h3 className="mt-4 bg-gradient-to-r from-slate-950 via-indigo-800 to-cyan-700 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl">
                        Week: {formatDisplayDate(report.weekStart)} -{" "}
                        {formatDisplayDate(report.weekEnd)}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        <span className="rounded-full bg-slate-100/80 px-3 py-1">
                          Completed {report.tasksCompleted?.length || 0} tasks
                        </span>
                        <span className="rounded-full bg-slate-100/80 px-3 py-1">
                          Planned {report.tasksPlanned?.length || 0} tasks
                        </span>
                        <span className="rounded-full bg-slate-100/80 px-3 py-1">
                          {report.blockers?.filter((b) => b.isOpen).length ||
                            0}{" "}
                          open blockers
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleView(report)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                      >
                        <Eye size={17} />
                        View
                      </button>

                      <button
                        onClick={() => handleEdit(report)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md"
                      >
                        <Edit3 size={17} />
                        Edit
                      </button>

                      {report.status === "draft" && (
                        <button
                          onClick={() => handleSubmitReport(report._id)}
                          disabled={submitting}
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(79,70,229,0.45)] disabled:opacity-60"
                        >
                          {submitting ? (
                            <Loader2 className="animate-spin" size={17} />
                          ) : (
                            <Send size={17} />
                          )}
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View/Edit Modal */}
          {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/70 bg-white/75 px-6 py-5 backdrop-blur-2xl">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                      Weekly Report
                    </p>
                    <h3 className="mt-1 bg-gradient-to-r from-slate-950 via-indigo-800 to-cyan-700 bg-clip-text text-xl font-semibold text-transparent">
                      {modalMode === "view" ? "View Report" : "Edit Report"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Week: {formatDisplayDate(selectedReport.weekStart)} -{" "}
                      {formatDisplayDate(selectedReport.weekEnd)}
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-2 text-slate-500 shadow-sm transition hover:bg-white hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-6">
                  {modalMode === "view" ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        <StatusBadge report={selectedReport} />

                        <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
                          {selectedReport.project?.name}
                        </span>

                        <span className="rounded-full border border-slate-200 bg-slate-100/80 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                          {selectedReport.hoursWorked || 0} hours
                        </span>
                      </div>

                      <ReportSection
                        title="Tasks Completed"
                        items={selectedReport.tasksCompleted}
                      />

                      <ReportSection
                        title="Tasks Planned for Next Week"
                        items={selectedReport.tasksPlanned}
                      />

                      <ReportSection
                        title="Blockers / Challenges"
                        items={selectedReport.blockers?.map((b) => b.text)}
                      />

                      <div className="rounded-[1.5rem] border border-white/70 bg-slate-50/80 p-5 shadow-sm backdrop-blur-xl">
                        <h4 className="bg-gradient-to-r from-slate-950 to-indigo-700 bg-clip-text font-semibold text-transparent">
                          Notes / Links
                        </h4>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {selectedReport.notes || "No notes added."}
                        </p>
                      </div>

                      <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                        <button
                          onClick={() => handleEdit(selectedReport)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/90 px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md"
                        >
                          <Edit3 size={17} />
                          Edit Report
                        </button>

                        {selectedReport.status === "draft" && (
                          <button
                            onClick={() =>
                              handleSubmitReport(selectedReport._id)
                            }
                            disabled={submitting}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(79,70,229,0.45)] disabled:opacity-60"
                          >
                            {submitting ? (
                              <Loader2 className="animate-spin" size={17} />
                            ) : (
                              <Send size={17} />
                            )}
                            Submit Report
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid gap-5 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Week Start
                          </label>

                          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                            <CalendarDays
                              size={18}
                              className="text-indigo-400"
                            />
                            <input
                              type="date"
                              name="weekStart"
                              value={editForm.weekStart}
                              onChange={handleEditChange}
                              className="w-full bg-transparent text-sm text-slate-700 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Week End
                          </label>

                          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                            <CalendarDays
                              size={18}
                              className="text-indigo-400"
                            />
                            <input
                              type="date"
                              name="weekEnd"
                              value={editForm.weekEnd}
                              onChange={handleEditChange}
                              className="w-full bg-transparent text-sm text-slate-700 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Project / Category
                          </label>

                          <select
                            name="project"
                            value={editForm.project}
                            onChange={handleEditChange}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          >
                            <option value="">Select project</option>

                            {projects.map((project) => (
                              <option key={project._id} value={project._id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <EditTextarea
                        label="Tasks Completed"
                        name="tasksCompleted"
                        value={editForm.tasksCompleted}
                        onChange={handleEditChange}
                        rows={5}
                      />

                      <EditTextarea
                        label="Tasks Planned for Next Week"
                        name="tasksPlanned"
                        value={editForm.tasksPlanned}
                        onChange={handleEditChange}
                        rows={5}
                      />

                      <EditTextarea
                        label="Blockers / Challenges"
                        name="blockers"
                        value={editForm.blockers}
                        onChange={handleEditChange}
                        rows={4}
                      />

                      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Hours Worked
                          </label>

                          <input
                            type="number"
                            min="0"
                            name="hoursWorked"
                            value={editForm.hoursWorked}
                            onChange={handleEditChange}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>

                        <EditTextarea
                          label="Notes / Links"
                          name="notes"
                          value={editForm.notes}
                          onChange={handleEditChange}
                          rows={3}
                        />
                      </div>

                      <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                        <button
                          onClick={() => setModalMode("view")}
                          className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleUpdateReport}
                          disabled={updating}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(79,70,229,0.45)] disabled:opacity-60"
                        >
                          {updating ? (
                            <Loader2 className="animate-spin" size={17} />
                          ) : (
                            <Save size={17} />
                          )}
                          {updating ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Reusable section for viewing report arrays
function ReportSection({ title, items = [] }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
      <h4 className="bg-gradient-to-r from-slate-950 to-indigo-700 bg-clip-text font-semibold text-transparent">
        {title}
      </h4>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No items added.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Reusable textarea for edit form
function EditTextarea({ label, name, value, onChange, rows }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}