import DashboardLayout from "../../layouts/DashboardLayout";

export default function ProjectManagement() {
  return (
    <DashboardLayout
      title="Project Management"
      subtitle="Add, edit, delete, and assign team members to projects."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">
          Project CRUD UI will be added later.
        </p>
      </div>
    </DashboardLayout>
  );
}