import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Loading state for button
  const [loading, setLoading] = useState(false);

  // Update input values
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit login request
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        const { token, user } = response.data;

        // Save token and user in auth context
        login(token, user);

        toast.success("Login successful");

        // Redirect based on user role
        if (user.role === "manager" || user.role === "admin") {
          navigate("/manager/dashboard");
        } else {
          navigate("/member/dashboard");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      {/* Attractive left side */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-cyan-500/20 to-slate-950"></div>

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
              <BarChart3 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TeamPro</h1>
              <p className="text-sm text-slate-300">Weekly Report Dashboard</p>
            </div>
          </div>

          <div>
            <h2 className="max-w-xl text-5xl font-bold leading-tight">
              Track weekly work, blockers, and team progress beautifully.
            </h2>
            <p className="mt-6 max-w-lg text-lg text-slate-300">
              A modern dashboard for team members and managers to submit,
              review, and analyze weekly reports.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">RBAC</p>
              <p className="mt-1 text-sm text-slate-300">Secure roles</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">AI</p>
              <p className="mt-1 text-sm text-slate-300">Assistant ready</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-3xl font-bold">Charts</p>
              <p className="mt-1 text-sm text-slate-300">Insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login form side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-3 text-slate-500">
              Login to continue to your dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
          >
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="manager@test.com"
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="123456"
                    className="w-full outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              No account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}