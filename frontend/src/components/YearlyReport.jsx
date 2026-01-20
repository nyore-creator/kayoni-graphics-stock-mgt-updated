// frontend/src/components/YearlyReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function YearlyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  // ✅ Use Vite environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/reports/yearly?year=${year}`);
        setReport(res.data);
      } catch (err) {
        console.error('Failed to fetch yearly report:', err);
        setError('❌ Failed to load yearly report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [year, API_BASE_URL]);

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">📊 Yearly Report</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border rounded w-24"
        />
      </div>

      {loading && <p className="text-gray-500">Loading report...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {report && (
        <>
          <h3 className="text-lg font-semibold mb-2">
            Year: {report.period.label}
          </h3>

          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-right">Bought</th>
                <th className="border p-2 text-right">Sold</th>
                <th className="border p-2 text-right">Revenue (Ksh)</th>
                <th className="border p-2 text-right">Cost (Ksh)</th>
                <th className="border p-2 text-right">Profit (Ksh)</th>
                <th className="border p-2 text-right">Stock at End</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map(item => (
                <tr key={item.name} className="hover:bg-gray-50">
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2 text-right">{item.bought}</td>
                  <td className="border p-2 text-right">{item.sold}</td>
                  <td className="border p-2 text-right">{item.revenue.toFixed(2)}</td>
                  <td className="border p-2 text-right">{item.cost.toFixed(2)}</td>
                  <td className="border p-2 text-right">{item.profit.toFixed(2)}</td>
                  <td className="border p-2 text-right">{item.stockAtEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-2">Totals</h4>
            <p>💰 Total Revenue: <strong>{report.totals.totalRevenue.toFixed(2)} Ksh</strong></p>
            <p>📦 Total Cost: <strong>{report.totals.totalCost.toFixed(2)} Ksh</strong></p>
            <p>📈 Total Profit: <strong>{report.totals.totalProfit.toFixed(2)} Ksh</strong></p>
            <p>🛒 Items with Activity: <strong>{report.totals.itemsWithActivity}</strong></p>
          </div>
        </>
      )}
    </div>
  );
}
