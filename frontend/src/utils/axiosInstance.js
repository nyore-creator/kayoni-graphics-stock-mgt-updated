// src/utils/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  // Example: https://kayoni-updated-smt.onrender.com/api
});

// ✅ Automatically attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kayoni_token"); // ✅ match AuthContext
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
