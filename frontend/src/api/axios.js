import axios from "axios";

// Create a reusable Axios instance for all backend API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add JWT token automatically to protected API requests
api.interceptors.request.use(
  (config) => {
    // Read token from browser localStorage
    const token = localStorage.getItem("teampro_token");

    // If token exists, attach it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;