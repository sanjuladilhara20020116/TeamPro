import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  // If user role is not allowed, redirect to correct dashboard
  if (!allowedRoles.includes(user?.role)) {
    if (user?.role === "manager" || user?.role === "admin") {
      return <Navigate to="/manager/dashboard" replace />;
    }

    return <Navigate to="/member/dashboard" replace />;
  }

  return children;
}