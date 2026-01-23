import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance"; // ✅ central axios instance

export default function YearlyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [downloading, setDownloading] = useState(false);

  // ---------------- FETCH YEARLY REPORT ----------------
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/reports/yearly?year=${year}`);
        setReport(res.data);
      } catch (err) {
        console.error("Failed to fetch yearly report:", err.response?.data || err.message);
        setError(`❌ Failed to load yearly report: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [year]);

  // ---------------- DOWNLOAD PDF ----------------
  const downloadPDF = async () => {
    try {
      setDownloading(true);

      const res = await api.get(`/reports/yearly/pdf?year=${year}`, {
        responseType: "blob", // 🔑 important for file download
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Yearly_Report_${year}.pdf`;
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
        <h2 className="text-2xl font-bold">📊 Yearly Report</h2>

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
          className="p-2 border rounded w-28"
        />
      </div>

      {loading && <p className="text-gray-500">Loading report...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {report && (
        <>
          <h3 className="text-lg font-semibold mb-2">
            Year: {report.period.label}
          </h3>

          {report.items.length === 0 ? (
            <p className="text-gray-600">No activity recorded for {year}.</p>
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
