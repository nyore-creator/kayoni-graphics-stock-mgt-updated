// frontend/src/utils/api.js
import axios from 'axios';

// Create an axios instance with your backend base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt'); // token saved after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
