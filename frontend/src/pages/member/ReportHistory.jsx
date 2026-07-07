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
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            report.isLate
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <CheckCircle2 size={14} />
          {report.isLate ? "Late" : "Submitted"}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
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
      {/* Filter section */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
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
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report list */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-600" size={34} />
            <p className="mt-3 text-sm text-slate-500">
              Loading your reports...
            </p>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <FileText className="mx-auto text-slate-300" size={52} />
          <h3 className="mt-5 text-xl font-bold text-slate-900">
            No reports found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Create your first weekly report from the Create Report page.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {reports.map((report) => (
            <div
              key={report._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge report={report} />

                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      <FolderKanban size={14} />
                      {report.project?.name || "No Project"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    Week: {formatDisplayDate(report.weekStart)} -{" "}
                    {formatDisplayDate(report.weekEnd)}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Completed {report.tasksCompleted?.length || 0} tasks,
                    planned {report.tasksPlanned?.length || 0} tasks,{" "}
                    {report.blockers?.filter((b) => b.isOpen).length || 0} open
                    blockers.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleView(report)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={17} />
                    View
                  </button>

                  <button
                    onClick={() => handleEdit(report)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Edit3 size={17} />
                    Edit
                  </button>

                  {report.status === "draft" && (
                    <button
                      onClick={() => handleSubmitReport(report._id)}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {modalMode === "view" ? "View Report" : "Edit Report"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Week: {formatDisplayDate(selectedReport.weekStart)} -{" "}
                  {formatDisplayDate(selectedReport.weekEnd)}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === "view" ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge report={selectedReport} />

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {selectedReport.project?.name}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
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

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h4 className="font-bold text-slate-900">Notes / Links</h4>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {selectedReport.notes || "No notes added."}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                      onClick={() => handleEdit(selectedReport)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      <Edit3 size={17} />
                      Edit Report
                    </button>

                    {selectedReport.status === "draft" && (
                      <button
                        onClick={() => handleSubmitReport(selectedReport._id)}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
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

                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                        <CalendarDays size={18} className="text-slate-400" />
                        <input
                          type="date"
                          name="weekStart"
                          value={editForm.weekStart}
                          onChange={handleEditChange}
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Week End
                      </label>

                      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                        <CalendarDays size={18} className="text-slate-400" />
                        <input
                          type="date"
                          name="weekEnd"
                          value={editForm.weekEnd}
                          onChange={handleEditChange}
                          className="w-full bg-transparent text-sm outline-none"
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
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
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
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
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

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                      onClick={() => setModalMode("view")}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleUpdateReport}
                      disabled={updating}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
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
    </DashboardLayout>
  );
}

// Reusable section for viewing report arrays
function ReportSection({ title, items = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <h4 className="font-bold text-slate-900">{title}</h4>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No items added.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
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
        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
      />
    </div>
  );
}