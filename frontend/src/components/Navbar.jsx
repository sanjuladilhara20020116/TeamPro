import {
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, subtitle, variant = "dashboard" }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const isHomeStyle = variant === "home";

  const dashboardPath =
    user?.role === "manager" || user?.role === "admin"
      ? "/manager/dashboard"
      : "/member/dashboard";

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 px-5 py-4 text-white backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-white/10 p-2 text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Show logo only on home page */}
          {isHomeStyle ? (
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 font-bold text-white shadow-lg">
                T
              </div>

              <div>
                <h1 className="text-lg font-bold text-white">TeamPro</h1>
                <p className="text-xs text-slate-400">
                  Weekly Report System
                </p>
              </div>
            </Link>
          ) : (
            title && (
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
              </div>
            )
          )}
        </div>

        {/* Center nav links */}
        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {visibleLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={16} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Right action only */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 sm:inline-flex"
            >
              <LogOut size={16} />
              Logout
            </button>
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden">
          <div className="ml-auto h-full w-80 max-w-[85vw] border-l border-white/10 bg-slate-950 p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Menu</h3>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-white"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-6 space-y-3">
              {visibleLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-white text-slate-950"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
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
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
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