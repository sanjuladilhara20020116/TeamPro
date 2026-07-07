import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  Loader2,
  Save,
  Send,
} from "lucide-react";
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
      <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 p-3 shadow-[0_25px_80px_rgba(15,23,42,0.10)] sm:p-5 lg:p-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute -left-28 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-white/60 bg-gradient-to-r from-indigo-600/95 via-violet-600/95 to-cyan-500/95 p-5 text-white sm:p-7 lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_34%)]" />
              <div className="pointer-events-none absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/30 bg-white/20 shadow-xl backdrop-blur-xl sm:h-16 sm:w-16">
                    <ClipboardCheck size={28} />
                  </div>

                  <div>
                    <p className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-50 backdrop-blur">
                      TeamPro Weekly
                    </p>

                    <h3 className="mt-3 text-2xl tracking-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl">
                      Create Work Report
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-50">
                      Add your completed tasks, next week plans, blockers,
                      hours, and useful notes in one clean report.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                  <div className="rounded-3xl border border-white/25 bg-white/15 p-4 text-center shadow-lg backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-50">
                      Draft
                    </p>
                    <p className="mt-1 text-sm text-white">
                      {savedReportId ? "Saved" : "Pending"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/25 bg-white/15 p-4 text-center shadow-lg backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-50">
                      Mode
                    </p>
                    <p className="mt-1 text-sm text-white">Weekly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-6">
                {/* Week and project row */}
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white/85">
                    <label className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-sm text-transparent">
                      Week Start
                    </label>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-inner transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10">
                      <CalendarDays size={18} className="text-indigo-500" />
                      <input
                        type="date"
                        name="weekStart"
                        value={formData.weekStart}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white/85">
                    <label className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-sm text-transparent">
                      Week End
                    </label>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-inner transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                      <CalendarDays size={18} className="text-cyan-500" />
                      <input
                        type="date"
                        name="weekEnd"
                        value={formData.weekEnd}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white/85">
                    <label className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm text-transparent">
                      Project / Category
                    </label>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-inner transition focus-within:border-violet-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/10">
                      <FolderKanban size={18} className="text-violet-500" />

                      <select
                        name="project"
                        value={formData.project}
                        onChange={handleChange}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none"
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
                <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                        <label className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-base text-transparent">
                          Tasks Completed
                        </label>
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Add one task per line.
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-600">
                      Required
                    </span>
                  </div>

                  <textarea
                    name="tasksCompleted"
                    value={formData.tasksCompleted}
                    onChange={handleChange}
                    rows={6}
                    placeholder={`Example:\nCreated authentication APIs\nTested project category endpoints\nFixed JWT token validation issue`}
                    className="mt-4 w-full resize-none rounded-3xl border border-emerald-100 bg-white/80 px-5 py-4 text-sm leading-6 text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Tasks planned */}
                <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
                        <label className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-base text-transparent">
                          Tasks Planned for Next Week
                        </label>
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Add one planned task per line.
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-600">
                      Required
                    </span>
                  </div>

                  <textarea
                    name="tasksPlanned"
                    value={formData.tasksPlanned}
                    onChange={handleChange}
                    rows={5}
                    placeholder={`Example:\nBuild frontend dashboard UI\nConnect report history page\nAdd manager charts`}
                    className="mt-4 w-full resize-none rounded-3xl border border-indigo-100 bg-white/80 px-5 py-4 text-sm leading-6 text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                {/* Blockers */}
                <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                        <label className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-base text-transparent">
                          Blockers / Challenges
                        </label>
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Optional. Add one blocker per line.
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-600">
                      Optional
                    </span>
                  </div>

                  <textarea
                    name="blockers"
                    value={formData.blockers}
                    onChange={handleChange}
                    rows={4}
                    placeholder={`Example:\nNeed to finalize dashboard chart data structure\nMongoDB Atlas connection issue fixed`}
                    className="mt-4 w-full resize-none rounded-3xl border border-amber-100 bg-white/80 px-5 py-4 text-sm leading-6 text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                {/* Hours and notes */}
                <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                  <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-sky-500" />
                      <label className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-base text-transparent">
                        Hours Worked
                      </label>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">Optional.</p>

                    <input
                      type="number"
                      min="0"
                      name="hoursWorked"
                      value={formData.hoursWorked}
                      onChange={handleChange}
                      placeholder="24"
                      className="mt-4 w-full rounded-3xl border border-cyan-100 bg-white/80 px-5 py-4 text-sm text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    />
                  </div>

                  <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-1.5 rounded-full bg-gradient-to-b from-slate-500 to-indigo-500" />
                      <label className="bg-gradient-to-r from-slate-700 to-indigo-600 bg-clip-text text-base text-transparent">
                        Optional Notes or Links
                      </label>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Add notes, GitHub links, task board links, or references.
                    </p>

                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Example: GitHub PR link, Jira ticket link, or extra notes."
                      className="mt-4 w-full resize-none rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 text-sm leading-6 text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-500/10"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/60 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving || submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-6 py-3 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-7 py-3 text-sm text-white shadow-[0_14px_35px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(79,70,229,0.45)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}