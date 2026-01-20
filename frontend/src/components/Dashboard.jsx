// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaMoneyBillWave, FaWarehouse, FaFilePdf, FaFileExcel, FaDownload } from 'react-icons/fa';
import { downloadPDFReport, downloadExcelReport, downloadCSVReport } from '../utils/ReportExporter';

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get('/api/reports/summary');
        setReport(res.data);
      } catch (err) {
        console.error('Failed to load report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleExport = async (type) => {
    if (!report) return;
    setExporting(type);
    try {
      switch (type) {
        case 'pdf':
          downloadPDFReport(report);
          break;
        case 'excel':
          downloadExcelReport(report);
          break;
        case 'csv':
          downloadCSVReport(report);
          break;
        default:
          break;
      }
    } catch (err) {
      alert('❌ Export failed: ' + err.message);
    } finally {
      setExporting('');
    }
  };

  if (loading) return <div className="text-center py-10 text-lg">📊 Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting === 'pdf'}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-70"
        >
          <FaFilePdf /> {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
        </button>
        <button
          onClick={() => handleExport('excel')}
          disabled={exporting === 'excel'}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-70"
        >
          <FaFileExcel /> {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
        </button>
        <button
          onClick={() => handleExport('csv')}
          disabled={exporting === 'csv'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-70"
        >
          <FaDownload /> {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center border-l-4 border-blue-500">
          <FaMoneyBillWave className="text-blue-600 mx-auto text-2xl mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Total Profit</h3>
          <p className="text-xl font-bold text-green-600">
            {report.totals.totalProfitKsh >= 0 ? '+' : ''}{report.totals.totalProfitKsh.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center border-l-4 border-green-500">
          <FaChartBar className="text-green-600 mx-auto text-2xl mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
          <p className="text-xl font-bold">
            {report.totals.totalRevenueKsh.toFixed(2)}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg text-center border-l-4 border-amber-500">
          <FaWarehouse className="text-amber-600 mx-auto text-2xl mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Stock Value</h3>
          <p className="text-xl font-bold">
            {report.totals.totalStockValueKsh.toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center border-l-4 border-purple-500">
          <FaDownload className="text-purple-600 mx-auto text-2xl mb-2" />
          <h3 className="text-sm font-medium text-gray-600">Total Items</h3>
          <p className="text-xl font-bold">
            {report.items.length}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">📦 Inventory Summary</h2>
          <span className="text-sm text-gray-500">
            As of {new Date().toLocaleDateString('en-KE')}
          </span>
        </div>
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-2 py-2 text-right">Bought<br/>(Qty)</th>
              <th className="px-2 py-2 text-right">Bought<br/>(Ksh)</th>
              <th className="px-2 py-2 text-right">Sold<br/>(Qty)</th>
              <th className="px-2 py-2 text-right">Revenue<br/>(Ksh)</th>
              <th className="px-2 py-2 text-right">In Stock</th>
              <th className="px-2 py-2 text-right">Profit<br/>(Ksh)</th>
              <th className="px-2 py-2 text-right">Stock Value<br/>(Ksh)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {report.items.map((item) => (
              <tr key={item.name} className={item.currentStock === 0 ? 'bg-red-50' : ''}>
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-2 py-2 text-right">{item.quantityBought}</td>
                <td className="px-2 py-2 text-right">Ksh {item.amountBoughtKsh.toFixed(2)}</td>
                <td className="px-2 py-2 text-right">{item.quantitySold}</td>
                <td className="px-2 py-2 text-right">Ksh {item.amountSoldKsh.toFixed(2)}</td>
                <td className="px-2 py-2 text-right">
                  <span className={`font-bold ${
                    item.currentStock === 0 ? 'text-red-600' :
                    item.currentStock < 5 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {item.currentStock}
                  </span>
                </td>
                <td className="px-2 py-2 text-right font-medium" 
                    style={{ color: item.profitKsh >= 0 ? '#16a34a' : '#dc2626' }}>
                  {item.profitKsh >= 0 ? '+' : ''}Ksh {item.profitKsh.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right">Ksh {item.stockValueKsh.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {report.items.length === 0 && (
          <p className="text-center py-4 text-gray-500">No items recorded yet.</p>
        )}
      </div>

      {/* Export Tip */}
      <div className="text-sm text-gray-500 text-center italic">
        💡 Tip: Use Excel for analysis, PDF for printing & sharing.
      </div>
    </div>
  );
}