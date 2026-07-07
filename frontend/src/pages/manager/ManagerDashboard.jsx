import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCcw,
  TrendingUp,
  Users,
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
      {/* Header controls */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Weekly Team Overview
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select a week to update summary metrics and workload charts.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        {/* Tasks completed trend */}
        <ChartCard
          title="Tasks Completed Trend"
          subtitle="Completed tasks, planned tasks, and hours over time."
        >
          {tasksTrend.length === 0 ? (
            <EmptyChart message="No trend data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={tasksTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completedTasks"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Completed Tasks"
                />
                <Line
                  type="monotone"
                  dataKey="plannedTasks"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4 }}
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
        >
          {projectWorkload.length === 0 ? (
            <EmptyChart message="No project workload data found." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={projectWorkload}
                    dataKey="completedTasks"
                    nameKey="projectName"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label
                  >
                    {projectWorkload.map((entry, index) => (
                      <Cell
                        key={entry.projectId}
                        fill={entry.color || workloadColors[index % workloadColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {projectWorkload.map((project, index) => (
                  <div
                    key={project.projectId}
                    className="rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            project.color ||
                            workloadColors[index % workloadColors.length],
                        }}
                      ></span>
                      <p className="text-sm font-semibold text-slate-900">
                        {project.projectName}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
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
        >
          {submissionChartData.length === 0 ? (
            <EmptyChart message="No team members found." />
          ) : (
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={submissionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis hide />
                <Tooltip
                  formatter={(value, name, props) => [
                    props.payload.status,
                    "Status",
                  ]}
                />
                <Bar dataKey="value" radius={[14, 14, 0, 0]}>
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
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

          {recentActivity.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <Users size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {activity.message}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Project: {activity.project?.name || "No project"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDateTime(activity.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
       
       
      <AIChatWidget weekStart={weekStart} />

    </DashboardLayout>
  );
}

// Reusable summary card component
function StatCard({ title, value, subtitle, icon: Icon, tone, loading }) {
  const toneClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`flex h-13 w-13 items-center justify-center rounded-2xl ${toneClasses[tone]} p-3`}
      >
        <Icon size={25} />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>

      <h3 className="mt-2 text-3xl font-bold text-slate-900">
        {loading ? "..." : value}
      </h3>

      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

// Reusable chart card wrapper
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}

// Empty chart placeholder
function EmptyChart({ message }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-2xl bg-slate-50">
      <div className="text-center">
        <BarChart3 className="mx-auto text-slate-300" size={48} />
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

// Chart legend badge
function LegendBadge({ color, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      ></span>
      {label}
    </div>

    
  );
}

