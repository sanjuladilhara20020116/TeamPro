import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LOGO_SRC = "/images/teamproLogo2.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        const { token, user } = response.data;

        login(token, user);
        toast.success("Login successful");

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
    <div className="min-h-dvh bg-slate-950">
      <div className="grid min-h-dvh lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left visual side */}
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#22d3ee_0,transparent_32%),radial-gradient(circle_at_bottom_right,#6366f1_0,transparent_36%)] opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-slate-950/70 to-slate-950" />

          <div className="absolute left-16 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-20 right-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            

            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <img
                src={LOGO_SRC}
                alt="TeamPro Large Logo"
                className="mb-10 h-72 w-72 object-contain drop-shadow-[0_30px_80px_rgba(34,211,238,0.45)] xl:h-96 xl:w-96"
              />

              

              <h2 className="text-4xl font-black leading-tight text-white xl:text-6xl">
                Track team progress beautifully.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 xl:text-lg">
                Submit weekly work, monitor blockers, review reports, and help
                managers understand team performance with clean dashboards.
              </p>
            </div>

            
          </div>
        </section>

        {/* Form side */}
        <section className="relative flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-indigo-200/60 blur-3xl" />

          <div className="relative z-10 w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <img
                src={LOGO_SRC}
                alt="TeamPro Logo"
                className="mb-4 h-28 w-28 object-contain drop-shadow-xl sm:h-32 sm:w-32"
              />
              <h1 className="text-3xl font-black text-slate-900">TeamPro</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Weekly Report Dashboard
              </p>
            </div>

            <div className="mb-7 text-center lg:text-left">
              <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600">
                Welcome back
              </p>

              <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Login
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-500">
                Enter your details to continue to your dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl sm:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Email Address
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                    <Mail size={18} className="text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="manager@test.com"
                      className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                    <Lock size={18} className="text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      placeholder="123456"
                      className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-6 py-3.5 font-bold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="mt-6 text-center text-sm text-slate-500">
                No account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-indigo-600 transition hover:text-indigo-700"
                >
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}