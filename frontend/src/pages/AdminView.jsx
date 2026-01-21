// frontend/src/pages/AdminView.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import { LogOut, Sun, Moon } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import MonthlyReport from '../components/MonthlyReport';
import YearlyReport from '../components/YearlyReport';

export default function AdminView() {
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Monthly report state
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [errorMonthly, setErrorMonthly] = useState('');
  const [period, setPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // Yearly report state
  const [yearlyReport, setYearlyReport] = useState(null);
  const [loadingYearly, setLoadingYearly] = useState(true);
  const [errorYearly, setErrorYearly] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  // Daily logs state
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [errorDaily, setErrorDaily] = useState('');

  // Fetch monthly report
  useEffect(() => {
    const fetchMonthlyReport = async () => {
      setLoadingMonthly(true);
      setErrorMonthly('');
      try {
        const res = await axios.get(
          `${API_BASE_URL}/reports/monthly?year=${period.year}&month=${period.month}`
        );
        setMonthlyReport(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch monthly report:', err);
        setErrorMonthly('❌ Failed to load monthly report');
      } finally {
        setLoadingMonthly(false);
      }
    };
    fetchMonthlyReport();
  }, [period, API_BASE_URL]);

  // Fetch yearly report
  useEffect(() => {
    const fetchYearlyReport = async () => {
      setLoadingYearly(true);
      setErrorYearly('');
      try {
        const res = await axios.get(`${API_BASE_URL}/reports/yearly?year=${year}`);
        setYearlyReport(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch yearly report:', err);
        setErrorYearly('❌ Failed to load yearly report');
      } finally {
        setLoadingYearly(false);
      }
    };
    fetchYearlyReport();
  }, [year, API_BASE_URL]);

  // Fetch daily logs
  useEffect(() => {
    const fetchDailyLogs = async () => {
      setLoadingDaily(true);
      setErrorDaily('');
      try {
        const dateStr = selectedDay.toISOString().split('T')[0]; // YYYY-MM-DD
        const res = await axios.get(`${API_BASE_URL}/reports/daily?date=${dateStr}`);
        setDailyLogs(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch daily logs:', err);
        setErrorDaily('❌ Failed to load daily logs');
      } finally {
        setLoadingDaily(false);
      }
    };
    fetchDailyLogs();
  }, [selectedDay, API_BASE_URL]);

  // Example chart data (replace with backend data later)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 15000, 18000, 20000],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
      },
      {
        label: 'Cost',
        data: [8000, 9000, 10000, 12000],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.2)',
      },
    ],
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      {/* Header */}
      <header className="flex justify-between items-center p-4 shadow bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold">🛠 Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700"
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 rounded bg-red-600 text-white flex items-center gap-1"
          >
            <LogOut /> Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 space-y-6">
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Revenue vs Cost</h2>
            <Line data={chartData} />
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Sales Overview</h2>
            <Bar data={chartData} />
          </div>
        </div>

        {/* Monthly Report */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📊 Monthly Report</h2>
            <div className="flex gap-2">
              <input
                type="number"
                value={period.year}
                onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
                className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600"
              />
              <select
                value={period.month}
                onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('en-KE', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingMonthly ? (
            <p>Loading monthly report...</p>
          ) : errorMonthly ? (
            <p className="text-red-500">{errorMonthly}</p>
          ) : monthlyReport ? (
            <MonthlyReport report={monthlyReport} />
          ) : (
            <p>No monthly report available.</p>
          )}
        </div>

        {/* Yearly Report */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📆 Yearly Report</h2>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="p-2 border rounded w-24 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {loadingYearly ? (
            <p>Loading yearly report...</p>
          ) : errorYearly ? (
            <p className="text-red-500">{errorYearly}</p>
          ) : yearlyReport ? (
            <YearlyReport report={yearlyReport} />
          ) : (
            <p>No yearly report available.</p>
          )}
        </div>

        {/* Daily Logs */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">📅 Daily Logs</h2>
          <DayPicker mode="single" selected={selectedDay} onSelect={setSelectedDay} />
          {loadingDaily ? (
            <p className="mt-4">Loading daily logs...</p>
          ) : errorDaily ? (
            <p className="mt-4 text-red-500">{errorDaily}</p>
          ) : dailyLogs.length === 0 ? (
            <p className="mt-4">No transactions for {selectedDay.toDateString()}.</p>
          ) : (
            <table className="w-full border-collapse mt-4 text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border p-2 text-left">Item</th>
                  <th className="border p-2 text-right">Type</th>
                  <th className="border p-2 text-right">Quantity</th>
                  <th className="border p-2 text-right">Amount (Ksh)</th>
                  <th className="border p-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {dailyLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="border p-2">{log.name}</td>
                    <td className="border p-2 text-right">{log.isPurchase ? 'Purchase' : 'Sale'}</td>
                    <td className="border p-2 text-right">{log.quantity}</td>
                    <td className="border p-2 text-right">
                      {log.isPurchase
                        ? Number(log.amountKsh).toFixed(2)
                        : Number(log.unitPriceKsh).toFixed(2)}
                    </td>
                    <td className="border p-2 text-right">
                      {new Date(log.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
