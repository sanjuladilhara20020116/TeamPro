import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";
import AIChatWidget from "../../components/AIChatWidget";

export default function ManagerDashboard() {
  // Selected week for dashboard summary
  const [weekStart, setWeekStart] = useState(getCurrentMonday());

  // Dashboard data states
  const [summary, setSummary] = useState(null);
  const [tasksTrend, setTasksTrend] = useState([]);
  const [projectWorkload, setProjectWorkload] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Main loading state
  const [loading, setLoading] = useState(false);

  // Get current Monday date for default selected week
  function getCurrentMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    return monday.toISOString().split("T")[0];
  }

  // Format backend date for readable UI
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format date and time for activity feed
  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch all dashboard data from backend APIs
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Run multiple dashboard API requests together
      const [
        summaryResponse,
        trendResponse,
        workloadResponse,
        statusResponse,
        activityResponse,
      ] = await Promise.all([
        api.get(`/dashboard/summary?weekStart=${weekStart}`),
        api.get("/dashboard/tasks-trend"),
        api.get(`/dashboard/project-workload?weekStart=${weekStart}`),
        api.get(`/dashboard/submission-status?weekStart=${weekStart}`),
        api.get("/dashboard/recent-activity?limit=6"),
      ]);

      // Save summary card data
      if (summaryResponse.data.success) {
        setSummary(summaryResponse.data);
      }

      // Save tasks trend chart data
      if (trendResponse.data.success) {
        setTasksTrend(trendResponse.data.trend);
      }

      // Save project workload chart data
      if (workloadResponse.data.success) {
        setProjectWorkload(workloadResponse.data.workload);
      }

      // Save submitted / pending / late status data
      if (statusResponse.data.success) {
        setSubmissionStatus(statusResponse.data);
      }

      // Save recent activity feed data
      if (activityResponse.data.success) {
        setRecentActivity(activityResponse.data.activities);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [weekStart]);

  // Convert submission status list into chart format
  const submissionChartData =
    submissionStatus?.statusList?.map((item) => ({
      name: item.user.name,
      status: item.status,
      value: 1,
    })) || [];

  // Colors for status chart
  const getStatusColor = (status) => {
    if (status === "submitted") return "#10b981";
    if (status === "late") return "#ef4444";
    return "#f59e0b";
  };

  // Colors for project workload pie chart
  const workloadColors = [
    "#4f46e5",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Analyze weekly reports, submission status, blockers, and workload."
    >
      <div className="space-y-7">
        {/* Hero + controls */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 shadow-2xl shadow-indigo-100 md:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-20 top-24 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_460px] xl:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-100 backdrop-blur-md">
                <Sparkles size={16} />
                Real-time team performance overview
              </div>

              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
                Monitor weekly progress, blockers, and submissions in one place.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Select a week to analyze team reporting, workload distribution,
                compliance rate, and recent submission activity.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <HeroBadge
                  icon={CalendarDays}
                  label="Selected Week"
                  value={formatDate(weekStart)}
                />
                <HeroBadge
                  icon={ShieldCheck}
                  label="Compliance"
                  value={`${summary?.complianceRate || 0}%`}
                />
                <HeroBadge
                  icon={Activity}
                  label="Reports"
                  value={summary?.totalReportsSubmitted || 0}
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Dashboard Controls
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Filter data by week and refresh live statistics.
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                  <BarChart3 size={24} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Week Start
                  </label>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                  />
                </div>

                <button
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:self-end"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <RefreshCcw size={18} />
                  )}
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Reports Submitted"
            value={summary?.totalReportsSubmitted || 0}
            subtitle="Submitted this selected week"
            icon={FileText}
            tone="indigo"
            loading={loading}
          />

          <StatCard
            title="Compliance Rate"
            value={`${summary?.complianceRate || 0}%`}
            subtitle="Submitted vs total members"
            icon={CheckCircle2}
            tone="emerald"
            loading={loading}
          />

          <StatCard
            title="Open Blockers"
            value={summary?.openBlockersCount || 0}
            subtitle="Across team reports"
            icon={AlertCircle}
            tone="red"
            loading={loading}
          />

          <StatCard
            title="Pending Reports"
            value={summary?.pendingCount || 0}
            subtitle="Members not submitted yet"
            icon={Clock}
            tone="amber"
            loading={loading}
          />
        </div>

        {/* Charts grid */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Tasks completed trend */}
          <ChartCard
            title="Tasks Completed Trend"
            subtitle="Completed tasks, planned tasks, and hours over time."
            icon={TrendingUp}
            badge="Trend"
          >
            {tasksTrend.length === 0 ? (
              <EmptyChart message="No trend data available yet." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={tasksTrend}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="completedTasks"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Completed Tasks"
                  />
                  <Line
                    type="monotone"
                    dataKey="plannedTasks"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Planned Tasks"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Project workload distribution */}
          <ChartCard
            title="Workload by Project"
            subtitle="Task distribution across projects for selected week."
            icon={BarChart3}
            badge="Workload"
          >
            {projectWorkload.length === 0 ? (
              <EmptyChart message="No project workload data found." />
            ) : (
              <div className="grid gap-5 lg:grid-cols-[1fr_230px]">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={projectWorkload}
                      dataKey="completedTasks"
                      nameKey="projectName"
                      cx="50%"
                      cy="50%"
                      outerRadius={108}
                      innerRadius={55}
                      paddingAngle={4}
                      label
                    >
                      {projectWorkload.map((entry, index) => (
                        <Cell
                          key={entry.projectId}
                          fill={
                            entry.color ||
                            workloadColors[index % workloadColors.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {projectWorkload.map((project, index) => (
                    <div
                      key={project.projectId}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shadow-sm"
                          style={{
                            backgroundColor:
                              project.color ||
                              workloadColors[index % workloadColors.length],
                          }}
                        ></span>

                        <p className="line-clamp-1 text-sm font-bold text-slate-900">
                          {project.projectName}
                        </p>
                      </div>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {project.completedTasks} tasks • {project.hoursWorked}h
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Second dashboard row */}
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          {/* Submission status chart */}
          <ChartCard
            title="Submission Status by Member"
            subtitle="Submitted, pending, and late status for selected week."
            icon={Users}
            badge="Members"
          >
            {submissionChartData.length === 0 ? (
              <EmptyChart message="No team members found." />
            ) : (
              <ResponsiveContainer width="100%" height={330}>
                <BarChart data={submissionChartData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name, props) => [
                      props.payload.status,
                      "Status",
                    ]}
                  />
                  <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={38}>
                    {submissionChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={getStatusColor(entry.status)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Status legend */}
            <div className="mt-4 flex flex-wrap gap-3">
              <LegendBadge color="#10b981" label="Submitted" />
              <LegendBadge color="#f59e0b" label="Pending" />
              <LegendBadge color="#ef4444" label="Late" />
            </div>
          </ChartCard>

          {/* Recent activity feed */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-100 blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-cyan-100 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-100">
                    <TrendingUp size={23} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Recent Activity
                    </h3>
                    <p className="text-sm text-slate-500">
                      Latest report updates and submissions.
                    </p>
                  </div>
                </div>

                <div className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 sm:block">
                  Live Feed
                </div>
              </div>

              {recentActivity.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No recent activity found.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="group rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100">
                          <Users size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-5 text-slate-900">
                            {activity.message}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Project: {activity.project?.name || "No project"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDateTime(activity.updatedAt)}
                          </p>
                        </div>

                        <ArrowUpRight
                          className="text-slate-300 opacity-0 transition group-hover:opacity-100"
                          size={18}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <AIChatWidget weekStart={weekStart} />
      </div>
    </DashboardLayout>
  );
}

const tooltipStyle = {
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
};

// Hero badge component
function HeroBadge({ icon: Icon, label, value }) {
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

// Reusable summary card component
function StatCard({ title, value, subtitle, icon: Icon, tone, loading }) {
  const toneClasses = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600",
      gradient: "from-indigo-500 to-violet-600",
      shadow: "shadow-indigo-100",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-100",
    },
    red: {
      icon: "bg-red-50 text-red-600",
      gradient: "from-red-500 to-rose-600",
      shadow: "shadow-red-100",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-100",
    },
  };

  const currentTone = toneClasses[tone];

  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${currentTone.gradient} opacity-10 transition group-hover:opacity-20`}
      />

      <div className="relative z-10">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${currentTone.icon} ${currentTone.shadow} shadow-lg`}
        >
          <Icon size={25} />
        </div>

        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">{title}</p>

            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {loading ? "..." : value}
            </h3>

            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
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

// Reusable chart card wrapper
function ChartCard({ title, subtitle, children, icon: Icon, badge }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-slate-100 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon size={22} />
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          {badge && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {badge}
            </span>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

// Empty chart placeholder
function EmptyChart({ message }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
          <BarChart3 size={42} />
        </div>

        <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>
      </div>
    </div>
  );
}

// Chart legend badge
function LegendBadge({ color, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
      <span
        className="h-3 w-3 rounded-full shadow-sm"
        style={{ backgroundColor: color }}
      ></span>
      {label}
    </div>
  );
}