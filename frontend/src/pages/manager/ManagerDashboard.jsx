import DashboardLayout from "../../layouts/DashboardLayout";
import { BarChart3, ClipboardList, FolderKanban } from "lucide-react";

export default function ManagerDashboard() {
  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Analyze weekly reports, blockers, and team workload."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <BarChart3 className="text-indigo-600" size={30} />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            Visual Insights
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Charts and summary metrics will be added soon.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ClipboardList className="text-cyan-600" size={30} />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            Team Reports
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            View and filter all member submissions.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <FolderKanban className="text-emerald-600" size={30} />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Projects</h3>
          <p className="mt-2 text-sm text-slate-500">
            Manage categories and assign members.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}