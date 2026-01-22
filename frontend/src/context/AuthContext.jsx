// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/axiosInstance"; // ✅ use central axios instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("kayoni_token");
    if (token) {
      // api instance already attaches token via interceptor
      setUser({ token }); 
      // Optional: validate token with backend
      // api.get("/auth/me").then(res => setUser(res.data)).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem("kayoni_token", token);

      // Store role and other user info
      setUser({ ...userData, token });
      return userData;
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("kayoni_token");
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isWorker = user?.role === "worker";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        isAdmin,
        isWorker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
