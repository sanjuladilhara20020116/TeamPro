import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Left navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:pl-72">
        <Navbar title={title} subtitle={subtitle} />

        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}