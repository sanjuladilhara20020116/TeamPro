import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  const [loading, setLoading] = useState(false);

  // Update form input values
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Register user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/register", formData);

      if (response.data.success) {
        const { token, user } = response.data;

        // Save token and user after successful registration
        login(token, user);

        toast.success("Account created successfully");

        // Redirect based on selected role
        if (user.role === "manager" || user.role === "admin") {
          navigate("/manager/dashboard");
        } else {
          navigate("/member/dashboard");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      {/* Left visual side */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-indigo-600/30 to-slate-950"></div>

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
              <BarChart3 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TeamPro</h1>
              <p className="text-sm text-slate-300">Work report platform</p>
            </div>
          </div>

          <div>
            <h2 className="max-w-xl text-5xl font-bold leading-tight">
              Create structured weekly reports for better team visibility.
            </h2>
            <p className="mt-6 max-w-lg text-lg text-slate-300">
              Members submit reports. Managers analyze progress, blockers, and
              workload using visual dashboards.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-widest text-cyan-200">
              Assignment Ready
            </p>
            <p className="mt-2 text-2xl font-bold">
              MERN + Tailwind + Dashboard Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Register form side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-slate-900">
              Create account
            </h2>
            <p className="mt-3 text-slate-500">
              Register as a team member or manager.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
          >
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-indigo-500">
                  <User size={18} className="text-slate-400" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Sanjula Dilhara"
                    className="w-full outline-none"
                  />
                </div>
              </div>

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
                    placeholder="member@test.com"
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
                    placeholder="Minimum 6 characters"
                    className="w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="member">Team Member</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}