const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const ExportLog = require('../models/ExportLog');
const { generateReportPDF } = require('../utils/pdfGenerator');

// --- Helper: Log export ---
const logExport = async (req, type, format = 'summary', params = {}) => {
  try {
    await ExportLog.create({
      userId: req.user?.id || 'anonymous',
      type,
      format,
      params,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (err) {
    console.warn('⚠️ Failed to log export:', err.message);
  }
};

// --- NEW HELPER: Fetch Sales Summary ---
// This groups all transactions of type 'sale' by month/day
const getSalesSummary = async (start, end, groupBy = 'month') => {
  const groupFormat = groupBy === 'month' ? { month: { $month: "$transactions.date" } } : { day: { $dayOfMonth: "$transactions.date" } };
  
  return await Item.aggregate([
    { $unwind: "$transactions" },
    { $match: { 
        "transactions.type": "sale", 
        "transactions.date": { $gte: start, $lte: end } 
    }},
    { $group: {
        _id: groupFormat,
        revenue: { $sum: "$transactions.totalKsh" },
        itemsSold: { $sum: "$transactions.quantity" },
        transactionCount: { $sum: 1 }
    }},
    { $sort: { "_id": 1 } }
  ]);
};

// --- Monthly PDF Report (Updated) ---
router.get('/monthly/pdf', async (req, res) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
  const y = parseInt(year);
  const m = parseInt(month) - 1;

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

  try {
    const items = await Item.find({});
    
    // Fetch the daily sales breakdown for this specific month
    const salesSummary = await getSalesSummary(start, end, 'day');

    const monthlyData = items.map(item => {
      const txs = (item.transactions || []).filter(t => t.date >= start && t.date <= end);
      const purchases = txs.filter(t => t.type === 'purchase');
      const sales = txs.filter(t => t.type === 'sale');

      const bought = purchases.reduce((s, t) => s + (t.quantity || 0), 0);
      const sold = sales.reduce((s, t) => s + (t.quantity || 0), 0);
      const cost = purchases.reduce((s, t) => s + (t.totalKsh || 0), 0);
      const revenue = sales.reduce((s, t) => s + (t.totalKsh || 0), 0);

      return {
        name: item.name,
        bought,
        sold,
        revenue,
        cost,
        profit: revenue - cost
      };
    });

    const totals = {
      totalRevenue: monthlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: monthlyData.reduce((s, i) => s + i.cost, 0),
      totalProfit: monthlyData.reduce((s, i) => s + i.profit, 0)
    };

    // Updated call to include salesSummary
    generateReportPDF(
      `Monthly_Report_${year}_${month}`,
      start.toLocaleString('en-KE', { month: 'long', year: 'numeric' }),
      monthlyData,
      totals,
      salesSummary, 
      res
    );

    await logExport(req, 'pdf', 'monthly', { year: y, month: m + 1 });
  } catch (err) {
    res.status(500).json({ message: '❌ Monthly PDF failed', error: err.message });
  }
});

// --- Yearly PDF Report (Updated) ---
router.get('/yearly/pdf', async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  const y = parseInt(year);

  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31, 23, 59, 59, 999);

  try {
    const items = await Item.find({});
    
    // Fetch the monthly sales breakdown for the whole year
    const salesSummary = await getSalesSummary(start, end, 'month');

    const yearlyData = items.map(item => {
      const txs = (item.transactions || []).filter(t => t.date >= start && t.date <= end);
      const purchases = txs.filter(t => t.type === 'purchase');
      const sales = txs.filter(t => t.type === 'sale');

      const bought = purchases.reduce((s, t) => s + (t.quantity || 0), 0);
      const sold = sales.reduce((s, t) => s + (t.quantity || 0), 0);
      const cost = purchases.reduce((s, t) => s + (t.totalKsh || 0), 0);
      const revenue = sales.reduce((s, t) => s + (t.totalKsh || 0), 0);

      return {
        name: item.name,
        bought,
        sold,
        revenue,
        cost,
        profit: revenue - cost
      };
    });

    const totals = {
      totalRevenue: yearlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: yearlyData.reduce((s, i) => s + i.cost, 0),
      totalProfit: yearlyData.reduce((s, i) => s + i.profit, 0)
    };

    // Updated call to include salesSummary
    generateReportPDF(
      `Yearly_Report_${year}`,
      `${year}`,
      yearlyData,
      totals,
      salesSummary,
      res
    );

    await logExport(req, 'pdf', 'yearly', { year: y });
  } catch (err) {
    res.status(500).json({ message: '❌ Yearly PDF failed', error: err.message });
  }
});

// ... [Keep Summary and Daily Logs as they were or update similarly] ...

module.exports = router;