import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  FileText,
  Users,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function Home() {
  const slides = [
    {
      word: "Project Progress",
      title: "Manager review workflow",
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
    },
    {
      word: "Weekly Reports",
      title: "Visual dashboard insights",
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
    },
    {
      word: "Team Analytics",
      title: "Collaborative team updates",
      url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80",
    },
    {
      word: "AI Insights",
      title: "AI-powered report analysis",
      url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [slides.length]);

  const features = [
    {
      icon: Users,
      title: "Multi-User Roles",
      text: "Team members submit reports while managers view team-wide dashboards.",
    },
    {
      icon: FileText,
      title: "Fixed Report Format",
      text: "Consistent weekly fields make reports easy to compare and analyze.",
    },
    {
      icon: BarChart3,
      title: "Visual Insights",
      text: "Charts show compliance, blockers, workload, and project distribution.",
    },
    {
      icon: Bot,
      title: "AI Assistant",
      text: "Managers can ask questions about reports, blockers, and progress.",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <Navbar variant="home" />

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl"></div>
      </div>

      {/* Hero */}
      <section className="relative z-10 min-h-screen overflow-hidden px-6 pt-32 pb-20">
        {/* Large dynamic background images */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <img
              key={slide.url}
              src={slide.url}
              alt={slide.title}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
                index === slideIndex
                  ? "scale-100 opacity-100"
                  : "scale-110 opacity-0"
              }`}
            />
          ))}

          {/* Light overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/35 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent"></div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[650px] max-w-7xl items-center">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-cyan-100 backdrop-blur-md">
              {slides[slideIndex].title}
            </p>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight text-white drop-shadow-2xl md:text-7xl">
              Manage{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                {slides[slideIndex].word}
              </span>{" "}
              in one place.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 drop-shadow-lg">
              TeamPro helps team members submit structured weekly reports and
              helps managers analyze progress, blockers, workload, and submission
              compliance with a modern dashboard.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-7 py-4 font-bold text-white shadow-2xl shadow-cyan-500/20 transition hover:-translate-y-1"
              >
                Start Demo
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Login
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
              <HeroStat value="100%" label="Weekly Tracking" />
              <HeroStat value="Easy" label="Report Submission" />
              <HeroStat value="AI" label="Assistant" />
            </div>

            {/* Image dots */}
            <div className="mt-10 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSlideIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === slideIndex
                      ? "w-10 bg-cyan-300"
                      : "w-2 bg-white/50"
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Features
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Built for professional weekly reporting.
          </h2>

          <p className="mt-5 text-slate-300">
            Clean user experience, reusable components, protected routes, and
            manager-focused analytics.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition hover:-translate-y-2 hover:bg-white/[0.1]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg">
                <feature.icon size={25} />
              </div>

              <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-3">
          <WorkflowCard
            number="01"
            title="Submit Report"
            text="Members create weekly reports using fixed fields."
          />

          <WorkflowCard
            number="02"
            title="Review Team"
            text="Managers filter reports by week, project, member, or status."
          />

          <WorkflowCard
            number="03"
            title="Analyze Insights"
            text="Dashboard charts show progress, blockers, and workload."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-violet-600 to-cyan-400 p-10 text-center shadow-2xl md:p-16">
          <h2 className="text-4xl font-black md:text-5xl">
            Start managing weekly reports smarter.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-indigo-50">
            Create a member account to submit reports or a manager account to
            explore analytics and team dashboards.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="rounded-2xl bg-white px-7 py-4 font-bold text-slate-950 shadow-xl transition hover:-translate-y-1"
            >
              Create Account
            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-xl transition hover:bg-white/20"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm text-slate-400">
        TeamPro Weekly Report Generator & Team Dashboard
      </footer>
    </div>
  );
}

function HeroStat({ value, label }) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur-md">
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-200">{label}</p>
    </div>
  );
}

function WorkflowCard({ number, title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-black text-slate-950">
        {number}
      </div>

      <h3 className="mt-6 text-2xl font-bold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-300">{text}</p>
    </div>
  );
}