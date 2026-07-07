import DashboardLayout from "../../layouts/DashboardLayout";
import { ClipboardCheck, Clock, FolderKanban } from "lucide-react";

export default function MemberDashboard() {
  return (
    <DashboardLayout
      title="Member Dashboard"
      subtitle="Manage your weekly reports and track your submissions."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ClipboardCheck className="text-indigo-600" size={30} />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Reports</h3>
          <p className="mt-2 text-sm text-slate-500">
            Create and submit your fixed weekly report.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Clock className="text-cyan-600" size={30} />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">History</h3>
          <p className="mt-2 text-sm text-slate-500">
            View your previous weekly submissions.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <FolderKanban className="text-emerald-600" size={30} />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Projects</h3>
          <p className="mt-2 text-sm text-slate-500">
            Attach your report to relevant work categories.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}