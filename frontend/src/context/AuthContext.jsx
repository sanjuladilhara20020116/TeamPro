import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

// Create authentication context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Store logged-in user details
  const [user, setUser] = useState(null);

  // Store loading state while checking saved session
  const [loading, setLoading] = useState(true);

  // Login user and save token/user in localStorage
  const login = (token, userData) => {
    localStorage.setItem("teampro_token", token);
    localStorage.setItem("teampro_user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout user by removing saved session data
  const logout = () => {
    localStorage.removeItem("teampro_token");
    localStorage.removeItem("teampro_user");
    setUser(null);
  };

  // Check saved token when app loads
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("teampro_token");
      const savedUser = localStorage.getItem("teampro_user");

      // If no token exists, user is not logged in
      if (!token) {
        setLoading(false);
        return;
      }

      // Temporarily show saved user for faster UI loading
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Verify token with backend
      const response = await api.get("/auth/me");

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem(
          "teampro_user",
          JSON.stringify(response.data.user)
        );
      }
    } catch (error) {
      // If token is invalid or expired, clear local session
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use authentication data easily
export const useAuth = () => {
  return useContext(AuthContext);
};