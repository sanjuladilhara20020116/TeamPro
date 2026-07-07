import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left side title */}
        <div className="flex items-center gap-4">
          <button className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden">
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
            <Search size={17} className="text-slate-400" />
            <input
              className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Search reports..."
            />
          </div>

          <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:bg-slate-50">
            <Bell size={18} />
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 font-bold text-white shadow-lg">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}