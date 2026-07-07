import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  FolderKanban,
  Loader2,
  Search,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function TeamReports() {
  // Store all team reports returned from backend
  const [reports, setReports] = useState([]);

  // Store members and projects for filter dropdowns
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  // Store submitted / pending / late status list
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Selected report for view modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Loading states
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Manager filters
  const [filters, setFilters] = useState({
    weekStart: getCurrentMonday(),
    member: "",
    project: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Get current week Monday as default selected week
  function getCurrentMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    return monday.toISOString().split("T")[0];
  }

  // Format backend date for display
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date and time for submittedAt
  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch members and projects for filters
  const fetchFilterData = async () => {
    try {
      const response = await api.get("/dashboard/filters");

      if (response.data.success) {
        setMembers(response.data.members);
        setProjects(response.data.projects);
      }
    } catch (error) {
      toast.error("Failed to load filter data");
    }
  };

  // Fetch team reports based on selected filters
  const fetchTeamReports = async () => {
    try {
      setLoadingReports(true);

      const queryParams = new URLSearchParams();

      // Use selected week only when date range is not selected
      if (filters.weekStart && !filters.startDate && !filters.endDate) {
        queryParams.append("weekStart", filters.weekStart);
      }

      // Optional member filter
      if (filters.member) {
        queryParams.append("member", filters.member);
      }

      // Optional project filter
      if (filters.project) {
        queryParams.append("project", filters.project);
      }

      // Optional draft/submitted filter
      if (filters.status) {
        queryParams.append("status", filters.status);
      }

      // Optional date range filters
      if (filters.startDate) {
        queryParams.append("startDate", filters.startDate);
      }

      if (filters.endDate) {
        queryParams.append("endDate", filters.endDate);
      }

      const response = await api.get(
        `/dashboard/team-reports?${queryParams.toString()}`
      );

      if (response.data.success) {
        setReports(response.data.reports);
      }
    } catch (error) {
      toast.error("Failed to load team reports");
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch submitted / pending / late status for selected week
  const fetchSubmissionStatus = async () => {
    if (!filters.weekStart) return;

    try {
      setLoadingStatus(true);

      const response = await api.get(
        `/dashboard/submission-status?weekStart=${filters.weekStart}`
      );

      if (response.data.success) {
        setSubmissionStatus(response.data);
      }
    } catch (error) {
      toast.error("Failed to load submission status");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchTeamReports();
  }, [
    filters.weekStart,
    filters.member,
    filters.project,
    filters.status,
    filters.startDate,
    filters.endDate,
  ]);

  useEffect(() => {
    fetchSubmissionStatus();
  }, [filters.weekStart]);

  // Update filter values
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      weekStart: getCurrentMonday(),
      member: "",
      project: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  };

  // Open report details modal
  const openReportModal = (report) => {
    setSelectedReport(report);
  };

  // Close report details modal
  const closeReportModal = () => {
    setSelectedReport(null);
  };

  return (
    <DashboardLayout
      title="Team Reports"
      subtitle="View reports across the team and track weekly submission status."
    >
      {/* Summary status cards */}
      <div className="mb-6 grid gap-5 md:grid-cols-4">
        <StatusSummaryCard
          title="Total Members"
          value={submissionStatus?.totalMembers || 0}
          icon={User}
          loading={loadingStatus}
          tone="slate"
        />

        <StatusSummaryCard
          title="Submitted"
          value={submissionStatus?.submittedCount || 0}
          icon={CheckCircle2}
          loading={loadingStatus}
          tone="emerald"
        />

        <StatusSummaryCard
          title="Pending"
          value={submissionStatus?.pendingCount || 0}
          icon={Clock}
          loading={loadingStatus}
          tone="amber"
        />

        <StatusSummaryCard
          title="Late"
          value={submissionStatus?.lateCount || 0}
          icon={AlertCircle}
          loading={loadingStatus}
          tone="red"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Filter size={21} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">Report Filters</h3>
            <p className="text-sm text-slate-500">
              Filter reports by week, member, project, status, or date range.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Selected Week
            </label>

            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
              <CalendarDays size={17} className="text-slate-400" />

              <input
                type="date"
                name="weekStart"
                value={filters.weekStart}
                onChange={handleFilterChange}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Member
            </label>

            <select
              name="member"
              value={filters.member}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Members</option>

              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Project
            </label>

            <select
              name="project"
              value={filters.project}
              onChange={handleFilterChange}
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

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Report Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              End Date
            </label>

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={clearFilters}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Submission status by member */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Submission Status by Team Member
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Status for selected week: {formatDate(filters.weekStart)}
            </p>
          </div>
        </div>

        {loadingStatus ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={30} />
          </div>
        ) : !submissionStatus?.statusList?.length ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
            No members found.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {submissionStatus.statusList.map((item) => (
              <div
                key={item.user._id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.user.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.user.email}
                    </p>
                  </div>

                  <MemberStatusBadge status={item.status} />
                </div>

                {item.report && (
                  <p className="mt-3 text-xs text-slate-500">
                    Project:{" "}
                    <span className="font-semibold">
                      {item.report.project?.name || "No project"}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reports table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Team Report Records
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Showing {reports.length} report records.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <Search size={17} />
            Data updates based on selected filters
          </div>
        </div>

        {loadingReports ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-indigo-600" size={34} />
              <p className="mt-3 text-sm text-slate-500">
                Loading team reports...
              </p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-slate-300" size={52} />
            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No reports found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing filters or ask members to submit reports.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Member</th>
                  <th className="px-6 py-4 font-semibold">Week</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Tasks</th>
                  <th className="px-6 py-4 font-semibold">Blockers</th>
                  <th className="px-6 py-4 font-semibold">Hours</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {report.user?.name || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {report.user?.email}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(report.weekStart)} -{" "}
                      {formatDate(report.weekEnd)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        <FolderKanban size={14} />
                        {report.project?.name || "No Project"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="font-semibold">
                        {report.tasksCompleted?.length || 0}
                      </span>{" "}
                      completed /{" "}
                      <span className="font-semibold">
                        {report.tasksPlanned?.length || 0}
                      </span>{" "}
                      planned
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {report.blockers?.filter((b) => b.isOpen).length || 0} open
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {report.hoursWorked || 0}h
                    </td>

                    <td className="px-6 py-4">
                      <ReportStatusBadge report={report} />
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => openReportModal(report)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report details modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Team Member Report
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedReport.user?.name} •{" "}
                  {formatDate(selectedReport.weekStart)} -{" "}
                  {formatDate(selectedReport.weekEnd)}
                </p>
              </div>

              <button
                onClick={closeReportModal}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap gap-3">
                <ReportStatusBadge report={selectedReport} />

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {selectedReport.project?.name}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {selectedReport.hoursWorked || 0} hours
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Submitted: {formatDateTime(selectedReport.submittedAt)}
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
                items={selectedReport.blockers?.map((blocker) => blocker.text)}
              />

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="font-bold text-slate-900">Notes / Links</h4>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedReport.notes || "No notes added."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// Reusable top summary card
function StatusSummaryCard({ title, value, icon: Icon, loading, tone }) {
  const toneClasses = {
    slate: "bg-slate-50 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
      >
        <Icon size={24} />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>

      <h3 className="mt-2 text-3xl font-bold text-slate-900">
        {loading ? "..." : value}
      </h3>
    </div>
  );
}

// Badge for submitted / late / draft report records
function ReportStatusBadge({ report }) {
  if (report.status === "submitted") {
    if (report.isLate) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <AlertCircle size={14} />
          Late
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} />
        Submitted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <Clock size={14} />
      Draft
    </span>
  );
}

// Badge for member weekly submission status
function MemberStatusBadge({ status }) {
  if (status === "submitted") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        Submitted
      </span>
    );
  }

  if (status === "late") {
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
        Late
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      Pending
    </span>
  );
}

// Reusable report section for modal
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