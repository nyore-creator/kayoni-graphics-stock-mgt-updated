// src/components/LoginForm.jsx
import React, { useState } from "react";
import api from "../utils/axiosInstance";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token); // ✅ store token
      setMessage("✅ Login successful!");
      if (onLogin) onLogin(res.data.token);
    } catch (err) {
      setMessage("❌ Login failed: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">🔐 Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "⏳ Logging in..." : "Login"}
        </button>
      </form>
      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}
