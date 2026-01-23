import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance"; // ✅ central axios instance

export default function MonthlyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [downloading, setDownloading] = useState(false);

  // ---------------- FETCH MONTHLY REPORT ----------------
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/reports/monthly?year=${year}&month=${month}`);
        setReport(res.data);
      } catch (err) {
        console.error("Failed to fetch monthly report:", err.response?.data || err.message);
        setError(`❌ Failed to load monthly report: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [year, month]);

  // ---------------- DOWNLOAD PDF ----------------
  const downloadPDF = async () => {
    try {
      setDownloading(true);

      const res = await api.get(`/reports/monthly/pdf?year=${year}&month=${month}`, {
        responseType: "blob", // 🔑 important for file download
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Monthly_Report_${year}_${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err.response?.data || err.message);
      alert("❌ Failed to download PDF report");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">📊 Monthly Report</h2>

        {report && (
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {downloading ? "Generating PDF..." : "📄 Download PDF"}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="p-2 border rounded w-24"
        />
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="p-2 border rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en-KE", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading report...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {report && (
        <>
          <h3 className="text-lg font-semibold mb-2">
            Period: {report.period.label}
          </h3>

          {report.items.length === 0 ? (
            <p className="text-gray-600">No activity recorded for this period.</p>
          ) : (
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
                {report.items.map((item) => (
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
          )}

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
