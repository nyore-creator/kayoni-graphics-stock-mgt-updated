// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('kayoni_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Optional: validate token with backend (e.g. /auth/me)
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem('kayoni_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Store role and other user info
      setUser({ ...userData, token });
      return userData;
    } catch (err) {
      console.error('❌ Login failed:', err.response?.data || err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('kayoni_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isWorker = user?.role === 'worker';

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
