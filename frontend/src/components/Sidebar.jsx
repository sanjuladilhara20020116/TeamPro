import {
  BarChart3,
  ClipboardList,
  FolderKanban,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  // Manager links
  const managerLinks = [
    {
      name: "Dashboard",
      path: "/manager/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Team Reports",
      path: "/manager/reports",
      icon: ClipboardList,
    },
    {
      name: "Projects",
      path: "/manager/projects",
      icon: FolderKanban,
    },
  ];

  // Team member links
  const memberLinks = [
    {
      name: "Dashboard",
      path: "/member/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Create Report",
      path: "/member/reports/create",
      icon: PlusCircle,
    },
    {
      name: "Report History",
      path: "/member/reports/history",
      icon: History,
    },
  ];

  // Select links based on user role
  const links =
    user?.role === "manager" || user?.role === "admin"
      ? managerLinks
      : memberLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col bg-slate-950 text-white shadow-2xl lg:flex">
      {/* Logo section */}
      <div className="border-b border-white/10 px-7 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg">
            <BarChart3 size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">TeamPro</h1>
            <p className="text-xs text-slate-400">Weekly Report System</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-5 py-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="mt-1 text-xs text-slate-400">{user?.email}</p>

          <span className="mt-3 inline-flex rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold capitalize text-indigo-200">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-2 px-5">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="border-t border-white/10 p-5">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}