import { Bell, Home, LayoutDashboard, LogOut, Menu, Search, User, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, subtitle, variant = "dashboard" }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const isHomeStyle = variant === "home";

  // Dashboard path depends on logged-in user's role
  const dashboardPath =
    user?.role === "manager" || user?.role === "admin"
      ? "/manager/dashboard"
      : "/member/dashboard";

  // Logout and go to home page
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      show: true,
    },
    {
      name: "Dashboard",
      path: dashboardPath,
      icon: LayoutDashboard,
      show: isAuthenticated,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
      show: isAuthenticated,
    },
    {
      name: "Login",
      path: "/login",
      icon: User,
      show: !isAuthenticated,
    },
    {
      name: "Register",
      path: "/register",
      icon: User,
      show: !isAuthenticated,
    },
  ];

  const visibleLinks = navLinks.filter((link) => link.show);

  return (
    <header
      className={`sticky top-0 z-40 border-b px-5 py-4 backdrop-blur-xl lg:px-8 ${
        isHomeStyle
          ? "border-white/10 bg-slate-950/75 text-white"
          : "border-slate-200 bg-white/80 text-slate-900"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left logo/title section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className={`rounded-xl border p-2 lg:hidden ${
              isHomeStyle
                ? "border-white/10 text-white"
                : "border-slate-200 text-slate-600"
            }`}
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 font-bold text-white shadow-lg">
              T
            </div>

            <div>
              <h1 className="text-lg font-bold">TeamPro</h1>
              <p
                className={`text-xs ${
                  isHomeStyle ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Weekly Report System
              </p>
            </div>
          </Link>

          {/* Dashboard page title */}
          {title && !isHomeStyle && (
            <div className="ml-4 hidden border-l border-slate-200 pl-5 md:block">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          )}
        </div>

        {/* Center nav links */}
        <nav className="hidden items-center gap-2 lg:flex">
          {visibleLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? isHomeStyle
                        ? "bg-white text-slate-950"
                        : "bg-indigo-50 text-indigo-700"
                      : isHomeStyle
                      ? "text-slate-300 hover:bg-white/10 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={16} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!isHomeStyle && (
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
              <Search size={17} className="text-slate-400" />
              <input
                className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search reports..."
              />
            </div>
          )}

          {isAuthenticated && !isHomeStyle && (
            <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition hover:bg-slate-50">
              <Bell size={18} />
            </button>
          )}

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 font-bold text-white shadow-lg"
              >
                {user?.name?.charAt(0)}
              </Link>

              <button
                onClick={handleLogout}
                className={`hidden items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition sm:inline-flex ${
                  isHomeStyle
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/register"
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden">
          <div className="ml-auto h-full w-80 max-w-[85vw] bg-white p-5 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Menu</h3>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-slate-200 p-2"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-6 space-y-2">
              {visibleLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {link.name}
                  </NavLink>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}