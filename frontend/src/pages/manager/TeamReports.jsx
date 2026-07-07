import DashboardLayout from "../../layouts/DashboardLayout";

export default function TeamReports() {
  return (
    <DashboardLayout
      title="Team Reports"
      subtitle="View all reports and filter by member, project, and date."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">
          Team report filters and table will be added later.
        </p>
      </div>
    </DashboardLayout>
  );
}