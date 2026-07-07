import { useEffect, useState } from "react";
import { CalendarDays, ClipboardCheck, FolderKanban, Loader2, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function CreateReport() {
  // Project list from backend
  const [projects, setProjects] = useState([]);

  // Saved report id is used when submitting after saving draft
  const [savedReportId, setSavedReportId] = useState(null);

  // Loading states for buttons
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fixed report fields required by assignment
  const [formData, setFormData] = useState({
    project: "",
    weekStart: "",
    weekEnd: "",
    tasksCompleted: "",
    tasksPlanned: "",
    blockers: "",
    hoursWorked: "",
    notes: "",
  });

  // Load active projects for project/category dropdown
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);

      const response = await api.get("/projects");

      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Update form input values
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Convert textarea lines into clean array
  const convertLinesToArray = (text) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
  };

  // Prepare request body according to backend model
  const buildReportPayload = () => {
    return {
      project: formData.project,
      weekStart: formData.weekStart,
      weekEnd: formData.weekEnd,

      // Fixed field: tasks completed
      tasksCompleted: convertLinesToArray(formData.tasksCompleted),

      // Fixed field: tasks planned for next week
      tasksPlanned: convertLinesToArray(formData.tasksPlanned),

      // Fixed field: blockers/challenges
      blockers: convertLinesToArray(formData.blockers).map((blocker) => ({
        text: blocker,
        isOpen: true,
      })),

      // Optional field: hours worked
      hoursWorked: Number(formData.hoursWorked) || 0,

      // Optional field: notes or links
      notes: formData.notes,
    };
  };

  // Basic frontend validation before API call
  const validateForm = () => {
    if (!formData.project) {
      toast.error("Please select a project/category");
      return false;
    }

    if (!formData.weekStart || !formData.weekEnd) {
      toast.error("Please select week start and week end dates");
      return false;
    }

    if (new Date(formData.weekEnd) < new Date(formData.weekStart)) {
      toast.error("Week end date must be after week start date");
      return false;
    }

    return true;
  };

  // Save weekly report as draft
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = buildReportPayload();

      let response;

      // If draft already exists in this page session, update it
      if (savedReportId) {
        response = await api.put(`/reports/${savedReportId}`, payload);
      } else {
        response = await api.post("/reports", payload);
      }

      if (response.data.success) {
        setSavedReportId(response.data.report._id);
        toast.success("Draft saved successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  // Submit weekly report
  const handleSubmitReport = async () => {
    if (!validateForm()) return;

    // Completed and planned tasks are required before final submission
    if (convertLinesToArray(formData.tasksCompleted).length === 0) {
      toast.error("Please add at least one completed task");
      return;
    }

    if (convertLinesToArray(formData.tasksPlanned).length === 0) {
      toast.error("Please add at least one planned task");
      return;
    }

    try {
      setSubmitting(true);

      const payload = buildReportPayload();
      let reportId = savedReportId;

      // If report is not saved yet, create draft first
      if (!reportId) {
        const createResponse = await api.post("/reports", payload);

        if (createResponse.data.success) {
          reportId = createResponse.data.report._id;
          setSavedReportId(reportId);
        }
      } else {
        // Update latest form changes before final submission
        await api.put(`/reports/${reportId}`, payload);
      }

      // Submit saved draft
      const submitResponse = await api.patch(`/reports/${reportId}/submit`);

      if (submitResponse.data.success) {
        toast.success("Weekly report submitted successfully");

        // Lock current page report id after submission
        setSavedReportId(submitResponse.data.report._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Create Weekly Report"
      subtitle="Submit your fixed weekly work report with consistent fields."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Main report form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg">
              <ClipboardCheck size={26} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Weekly Work Report
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                All team members use the same fixed report structure.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Week and project row */}
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Week Start
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
                  <CalendarDays size={18} className="text-slate-400" />
                  <input
                    type="date"
                    name="weekStart"
                    value={formData.weekStart}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Week End
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
                  <CalendarDays size={18} className="text-slate-400" />
                  <input
                    type="date"
                    name="weekEnd"
                    value={formData.weekEnd}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Project / Category
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
                  <FolderKanban size={18} className="text-slate-400" />

                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="">
                      {loadingProjects ? "Loading..." : "Select project"}
                    </option>

                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tasks completed */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Tasks Completed
              </label>
              <p className="mt-1 text-xs text-slate-400">
                Add one task per line.
              </p>

              <textarea
                name="tasksCompleted"
                value={formData.tasksCompleted}
                onChange={handleChange}
                rows={6}
                placeholder={`Example:\nCreated authentication APIs\nTested project category endpoints\nFixed JWT token validation issue`}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Tasks planned */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Tasks Planned for Next Week
              </label>
              <p className="mt-1 text-xs text-slate-400">
                Add one planned task per line.
              </p>

              <textarea
                name="tasksPlanned"
                value={formData.tasksPlanned}
                onChange={handleChange}
                rows={5}
                placeholder={`Example:\nBuild frontend dashboard UI\nConnect report history page\nAdd manager charts`}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Blockers */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Blockers / Challenges
              </label>
              <p className="mt-1 text-xs text-slate-400">
                Optional. Add one blocker per line.
              </p>

              <textarea
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                rows={4}
                placeholder={`Example:\nNeed to finalize dashboard chart data structure\nMongoDB Atlas connection issue fixed`}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
              />
            </div>

            {/* Hours and notes */}
            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Hours Worked
                </label>
                <p className="mt-1 text-xs text-slate-400">Optional.</p>

                <input
                  type="number"
                  min="0"
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  placeholder="24"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Optional Notes or Links
                </label>
                <p className="mt-1 text-xs text-slate-400">
                  Add notes, GitHub links, task board links, or references.
                </p>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Example: GitHub PR link, Jira ticket link, or extra notes."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={saving || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Right side guide panel */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-cyan-500 p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold">Report Rules</h3>

            <ul className="mt-5 space-y-3 text-sm text-indigo-50">
              <li>• Use the fixed field order.</li>
              <li>• Add one task per line.</li>
              <li>• Save draft before final submission.</li>
              <li>• Submitted reports appear in manager dashboard.</li>
              <li>• One report is allowed per selected week.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900">Draft Status</h3>

            {savedReportId ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                Draft saved successfully. You can submit this report now.
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                This report is not saved yet.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900">Submission Deadline</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Backend rule: a report is marked late if it is submitted after
              the selected week end date at 6:00 PM.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}