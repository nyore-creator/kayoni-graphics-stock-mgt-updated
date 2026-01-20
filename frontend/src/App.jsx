// frontend/src/App.jsx
import React, { useState } from 'react';
import WorkerView from './pages/WorkerView';
import AdminView from './pages/AdminView';
import { FiUser, FiLock } from 'react-icons/fi';

export default function App() {
  const [view, setView] = useState('worker'); // 'worker' | 'admin' | 'login'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = 'kayoni2026'; // 🔒 Replace with backend auth in production

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setView('admin');
        setPassword('');
      } else {
        setError('❌ Incorrect password');
        setPassword('');
      }
      setLoading(false);
    }, 500); // simulate processing delay
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">Kayoni Graphics</h1>
        <div>
          {view === 'worker' ? (
            <button
              onClick={() => setView('login')}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <FiLock /> Admin Login
            </button>
          ) : (
            <button
              onClick={() => setView('worker')}
              className="flex items-center gap-1 text-gray-600 hover:underline"
            >
              <FiUser /> Switch to Worker View
            </button>
          )}
        </div>
      </nav>

      <main className="flex-grow py-6">
        {view === 'worker' && <WorkerView />}
        {view === 'admin' && <AdminView />}

        {view === 'login' && (
          <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">🔐 Admin Access</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full p-2 border rounded mb-2"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded text-white ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? '⏳ Logging in...' : 'Login'}
              </button>
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
          </div>
        )}
      </main>

      <footer className="text-center text-gray-500 text-sm p-4 border-t">
        © {new Date().getFullYear()} Kayoni Graphics — Printing, Branding & Design
      </footer>
    </div>
  );
}
