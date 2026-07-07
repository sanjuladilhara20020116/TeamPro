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
  Sparkles,
  Users,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";

export default function TeamReports() {
  const [reports, setReports] = useState([]);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [filters, setFilters] = useState({
    weekStart: getCurrentMonday(),
    member: "",
    project: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  function getCurrentMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    return monday.toISOString().split("T")[0];
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const fetchTeamReports = async () => {
    try {
      setLoadingReports(true);

      const queryParams = new URLSearchParams();

      if (filters.weekStart && !filters.startDate && !filters.endDate) {
        queryParams.append("weekStart", filters.weekStart);
      }

      if (filters.member) {
        queryParams.append("member", filters.member);
      }

      if (filters.project) {
        queryParams.append("project", filters.project);
      }

      if (filters.status) {
        queryParams.append("status", filters.status);
      }

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

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

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

  const openReportModal = (report) => {
    setSelectedReport(report);
  };

  const closeReportModal = () => {
    setSelectedReport(null);
  };

  return (
    <DashboardLayout
      title="Team Reports"
      subtitle="View reports across the team and track weekly submission status."
    >
      <div className="space-y-7">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 shadow-2xl shadow-indigo-100 md:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-28 bottom-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-gradient-to-r from-white/15 to-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 shadow-lg shadow-cyan-950/20 backdrop-blur">
                <Sparkles size={16} className="text-cyan-300" />
                Manager Report Control Center
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
                Track every{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  weekly report
                </span>{" "}
                with a clean team overview.
              </h1>

              <p className="mt-4 max-w-2xl border-l-4 border-cyan-300/60 pl-4 text-sm leading-6 text-slate-300 md:text-base">
                Review member submissions, filter report records, check pending
                updates, and inspect blockers from one professional dashboard.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <HeroMiniCard
                  icon={CalendarDays}
                  label="Selected Week"
                  value={formatDate(filters.weekStart)}
                />

                <HeroMiniCard
                  icon={Users}
                  label="Team Members"
                  value={submissionStatus?.totalMembers || 0}
                />

                <HeroMiniCard
                  icon={FileText}
                  label="Report Records"
                  value={reports.length}
                />
              </div>
            </div>

            <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <SlidersHorizontal size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Current Report View
                  </h3>
                  <p className="text-sm text-slate-300">
                    Data updates automatically by filters.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <HeroStat
                  label="Submitted"
                  value={submissionStatus?.submittedCount || 0}
                />
                <HeroStat
                  label="Pending"
                  value={submissionStatus?.pendingCount || 0}
                />
                <HeroStat
                  label="Late"
                  value={submissionStatus?.lateCount || 0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-100 blur-3xl" />
          <div className="absolute -bottom-20 left-20 h-44 w-44 rounded-full bg-cyan-100 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-xl shadow-indigo-100">
                  <Filter size={24} />
                </div>

                <div>
                  <div className="mb-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-indigo-600">
                    Smart Filters
                  </div>

                  <h3 className="bg-gradient-to-r from-slate-950 via-indigo-700 to-cyan-600 bg-clip-text text-2xl font-black text-transparent">
                    Report Filters
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Filter reports by week, member, project, status, or date
                    range.
                  </p>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <FilterField label="Selected Week" icon={CalendarDays}>
                <input
                  type="date"
                  name="weekStart"
                  value={filters.weekStart}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              </FilterField>

              <FilterField label="Member">
                <select
                  name="member"
                  value={filters.member}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="">All Members</option>

                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Project">
                <select
                  name="project"
                  value={filters.project}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="">All Projects</option>

                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Report Status">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                </select>
              </FilterField>

              <FilterField label="Start Date">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              </FilterField>

              <FilterField label="End Date">
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
                />
              </FilterField>
            </div>
          </div>
        </div>

        {/* Submission Status */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-100">
                <Users size={24} />
              </div>

              <div>
                <div className="mb-1 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-600">
                  Weekly Tracking
                </div>

                <h3 className="bg-gradient-to-r from-slate-950 via-emerald-700 to-teal-600 bg-clip-text text-2xl font-black text-transparent">
                  Submission Status by Team Member
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Status for selected week: {formatDate(filters.weekStart)}
                </p>
              </div>
            </div>

            <div className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-emerald-100">
              Weekly Status
            </div>
          </div>

          {loadingStatus ? (
            <div className="flex min-h-[140px] items-center justify-center rounded-2xl bg-slate-50">
              <Loader2 className="animate-spin text-indigo-600" size={30} />
            </div>
          ) : !submissionStatus?.statusList?.length ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              No members found.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {submissionStatus.statusList.map((item) => (
                <div
                  key={item.user._id}
                  className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
                        <User size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">
                          {item.user.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.user.email}
                        </p>
                      </div>
                    </div>

                    <MemberStatusBadge status={item.status} />
                  </div>

                  {item.report && (
                    <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                      Project:{" "}
                      <span className="font-bold text-slate-700">
                        {item.report.project?.name || "No project"}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports Table */}
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-xl shadow-indigo-100">
                <FileText size={24} />
              </div>

              <div>
                <div className="mb-1 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-600">
                  Report Database
                </div>

                <h3 className="bg-gradient-to-r from-slate-950 via-indigo-700 to-cyan-600 bg-clip-text text-2xl font-black text-transparent">
                  Team Report Records
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Showing {reports.length} report records.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
              <Search size={17} />
              Data updates based on selected filters
            </div>
          </div>

          {loadingReports ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <Loader2
                  className="mx-auto animate-spin text-indigo-600"
                  size={34}
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading team reports...
                </p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                <FileText size={52} />
              </div>

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
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Member</th>
                    <th className="px-6 py-4 font-bold">Week</th>
                    <th className="px-6 py-4 font-bold">Project</th>
                    <th className="px-6 py-4 font-bold">Tasks</th>
                    <th className="px-6 py-4 font-bold">Blockers</th>
                    <th className="px-6 py-4 font-bold">Hours</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr
                      key={report._id}
                      className="transition hover:bg-indigo-50/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <User size={18} />
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              {report.user?.name || "Unknown"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {report.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {formatDate(report.weekStart)} -{" "}
                        {formatDate(report.weekEnd)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                          <FolderKanban size={14} />
                          {report.project?.name || "No Project"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        <span className="font-bold text-slate-900">
                          {report.tasksCompleted?.length || 0}
                        </span>{" "}
                        completed /{" "}
                        <span className="font-bold text-slate-900">
                          {report.tasksPlanned?.length || 0}
                        </span>{" "}
                        planned
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        <span className="font-bold text-slate-900">
                          {report.blockers?.filter((b) => b.isOpen).length || 0}
                        </span>{" "}
                        open
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {report.hoursWorked || 0}h
                      </td>

                      <td className="px-6 py-5">
                        <ReportStatusBadge report={report} />
                      </td>

                      <td className="px-6 py-5">
                        <button
                          onClick={() => openReportModal(report)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md"
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

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
              <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-6">
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/30 blur-3xl" />
                <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-100">
                      <FileText size={14} className="text-cyan-300" />
                      Report Details
                    </div>

                    <h3 className="text-3xl font-black text-white">
                      Team Member{" "}
                      <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                        Report
                      </span>
                    </h3>

                    <p className="mt-1 text-sm text-slate-300">
                      {selectedReport.user?.name} •{" "}
                      {formatDate(selectedReport.weekStart)} -{" "}
                      {formatDate(selectedReport.weekEnd)}
                    </p>
                  </div>

                  <button
                    onClick={closeReportModal}
                    className="rounded-2xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(90vh-150px)] space-y-6 overflow-y-auto p-6">
                <div className="flex flex-wrap gap-3">
                  <ReportStatusBadge report={selectedReport} />

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {selectedReport.project?.name || "No Project"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {selectedReport.hoursWorked || 0} hours
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
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
      </div>
    </DashboardLayout>
  );
}

function HeroMiniCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-200">
          <Icon size={18} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-300">{label}</p>
          <p className="text-sm font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center text-white">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-300">{label}</p>
    </div>
  );
}

function FilterField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>

      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
        {Icon && <Icon size={17} className="text-slate-400" />}
        {children}
      </div>
    </div>
  );
}

function StatusSummaryCard({ title, value, icon: Icon, loading, tone }) {
  const toneClasses = {
    slate: {
      icon: "bg-slate-50 text-slate-700",
      gradient: "from-slate-500 to-slate-700",
      shadow: "shadow-slate-100",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-100",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-100",
    },
    red: {
      icon: "bg-red-50 text-red-700",
      gradient: "from-red-500 to-rose-600",
      shadow: "shadow-red-100",
    },
  };

  const currentTone = toneClasses[tone];

  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${currentTone.gradient} opacity-10 transition group-hover:opacity-20`}
      />

      <div className="relative z-10">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${currentTone.icon} ${currentTone.shadow} shadow-lg`}
        >
          <Icon size={24} />
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>

            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {loading ? "..." : value}
            </h3>
          </div>

          <div
            className={`rounded-full bg-gradient-to-br ${currentTone.gradient} p-2 text-white opacity-0 shadow-lg transition group-hover:translate-x-1 group-hover:opacity-100`}
          >
            <ArrowUpRight size={17} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportStatusBadge({ report }) {
  if (report.status === "submitted") {
    if (report.isLate) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-100">
          <AlertCircle size={14} />
          Late
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
        <CheckCircle2 size={14} />
        Submitted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
      <Clock size={14} />
      Draft
    </span>
  );
}

function MemberStatusBadge({ status }) {
  if (status === "submitted") {
    return (
      <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
        Submitted
      </span>
    );
  }

  if (status === "late") {
    return (
      <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-100">
        Late
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
      Pending
    </span>
  );
}

function ReportSection({ title, items = [] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="font-bold text-slate-900">{title}</h4>

      {items.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
          No items added.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}