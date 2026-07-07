import DashboardLayout from "../../layouts/DashboardLayout";
import {
  ClipboardCheck,
  Clock,
  FolderKanban,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function MemberDashboard() {
  const cards = [
    {
      title: "Reports",
      description: "Create and submit your fixed weekly report.",
      icon: ClipboardCheck,
      color: "from-indigo-500 to-violet-600",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      stat: "Weekly",
    },
    {
      title: "History",
      description: "View your previous weekly submissions.",
      icon: Clock,
      color: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      stat: "Tracked",
    },
    {
      title: "Projects",
      description: "Attach your report to relevant work categories.",
      icon: FolderKanban,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      stat: "Assigned",
    },
  ];

  return (
    <DashboardLayout
      title="Member Dashboard"
      subtitle="Manage your weekly reports and track your submissions."
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 shadow-xl">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-20 left-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100 backdrop-blur">
                <Sparkles size={16} />
                Welcome back, Team Member
              </div>

              <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white md:text-4xl">
                Stay organized with your weekly progress reports
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Submit reports on time, review your previous work, and keep your
                project progress clearly connected with your team activities.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur-md">
              <p className="text-sm text-slate-300">Current Status</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-400/20 p-3 text-emerald-300">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Active</h3>
                  <p className="text-sm text-slate-300">Ready to submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-gradient-to-br ${card.color} opacity-10 transition-opacity duration-300 group-hover:opacity-20`}
                />

                <div className="relative z-10">
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg} ${card.text}`}
                  >
                    <Icon size={30} />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        {card.stat}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        {card.title}
                      </h3>
                    </div>

                    <div
                      className={`rounded-full bg-gradient-to-br ${card.color} p-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100`}
                    >
                      <ArrowRight size={18} />
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    {card.description}
                  </p>

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full w-2/3 rounded-full bg-gradient-to-r ${card.color}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Weekly Report Flow
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Follow this simple workflow to keep your team updated.
            </p>

            <div className="mt-6 space-y-4">
              {["Create report", "Attach project category", "Submit weekly update"].map(
                (item, index) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
                      {index + 1}
                    </div>
                    <p className="font-medium text-slate-700">{item}</p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Submission Reminder
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep your weekly progress updated before the deadline. Clear
              reporting helps managers understand your work, blockers, and next
              planned tasks.
            </p>

            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Good report includes:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Completed tasks", "Blockers", "Next goals"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}