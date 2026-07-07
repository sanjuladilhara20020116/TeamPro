import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import MemberDashboard from "./pages/member/MemberDashboard";
import CreateReport from "./pages/member/CreateReport";
import ReportHistory from "./pages/member/ReportHistory";

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import TeamReports from "./pages/manager/TeamReports";
import ProjectManagement from "./pages/manager/ProjectManagement";

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Team member protected routes */}
      <Route
        path="/member/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["member"]}>
              <MemberDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/reports/create"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["member"]}>
              <CreateReport />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/reports/history"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["member"]}>
              <ReportHistory />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Manager/Admin protected routes */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["manager", "admin"]}>
              <ManagerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["manager", "admin"]}>
              <TeamReports />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/projects"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["manager", "admin"]}>
              <ProjectManagement />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Wrong route fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;