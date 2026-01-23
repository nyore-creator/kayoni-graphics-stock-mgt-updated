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

// --- Summary Report ---
router.get('/summary', async (req, res) => {
  try {
    const items = await Item.find();
    res.json({ message: '✅ Summary report placeholder', count: items.length });
    await logExport(req, 'json', 'summary');
  } catch (err) {
    res.status(500).json({ message: '❌ Summary report failed', error: err.message });
  }
});

// --- Monthly JSON Report ---
router.get('/monthly', async (req, res) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
  const y = parseInt(year);
  const m = parseInt(month) - 1;

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

  try {
    const items = await Item.find({});

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
        profit: revenue - cost,
        stockAtEnd: item.currentStock ?? 0
      };
    });

    const totals = {
      totalRevenue: monthlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: monthlyData.reduce((s, i) => s + i.cost, 0),
      totalProfit: monthlyData.reduce((s, i) => s + i.profit, 0),
      itemsWithActivity: monthlyData.filter(i => i.bought > 0 || i.sold > 0).length
    };

    res.json({
      period: {
        year: y,
        month: m + 1,
        label: start.toLocaleString('en-KE', { month: 'long', year: 'numeric' })
      },
      items: monthlyData,
      totals
    });

    await logExport(req, 'json', 'monthly', { year: y, month: m + 1 });
  } catch (err) {
    res.status(500).json({ message: '❌ Monthly report failed', error: err.message });
  }
});

// --- Monthly PDF Report ---
router.get('/monthly/pdf', async (req, res) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
  const y = parseInt(year);
  const m = parseInt(month) - 1;

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

  try {
    const items = await Item.find({});

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
        profit: revenue - cost,
        stockAtEnd: item.currentStock ?? 0
      };
    });

    const totals = {
      totalRevenue: monthlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: monthlyData.reduce((s, i) => s + i.cost, 0),
      totalProfit: monthlyData.reduce((s, i) => s + i.profit, 0),
      itemsWithActivity: monthlyData.filter(i => i.bought > 0 || i.sold > 0).length
    };

    generateReportPDF(
      `Monthly_Report_${year}_${month}`,
      start.toLocaleString('en-KE', { month: 'long', year: 'numeric' }),
      monthlyData,
      totals,
      res
    );

    await logExport(req, 'pdf', 'monthly', { year: y, month: m + 1 });
  } catch (err) {
    res.status(500).json({ message: '❌ Monthly PDF failed', error: err.message });
  }
});

// --- Yearly JSON Report ---
router.get('/yearly', async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  const y = parseInt(year);

  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31, 23, 59, 59, 999);

  try {
    const items = await Item.find({});

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
        profit: revenue - cost,
        stockAtEnd: item.currentStock ?? 0
      };
    });

    const totals = {
      totalRevenue: yearlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: yearlyData.reduce((s, i) => s + i.cost, 0),
      totalProfit: yearlyData.reduce((s, i) => s + i.profit, 0),
      itemsWithActivity: yearlyData.filter(i => i.bought > 0 || i.sold > 0).length
    };

    res.json({
      period: {
        year: y,
        label: `${year}`
      },
      items: yearlyData,
      totals
    });

    await logExport(req, 'json', 'yearly', { year: y });
  } catch (err) {
    res.status(500).json({ message: '❌ Yearly report failed', error: err.message });
  }
});

// --- Yearly PDF Report ---
router.get('/yearly/pdf', async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  const y = parseInt(year);

  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31, 23, 59, 59, 999);

  try {
    const items = await Item.find({});

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
        profit: revenue - cost,
        stockAtEnd: item.currentStock ?? 0
      };
    });

    const totals = {
      totalRevenue: yearlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: yearlyData.reduce((s, i) => s + i.cost, 0),
      totalProfit: yearlyData.reduce((s, i) => s + i.profit, 0),
      itemsWithActivity: yearlyData.filter(i => i.bought > 0 || i.sold > 0).length
    };

    generateReportPDF(
      `Yearly_Report_${year}`,
      `${year}`,
      yearlyData,
      totals,
      res
    );

    await logExport(req, 'pdf', 'yearly', { year: y });
  } catch (err) {
    res.status(500).json({ message: '❌ Yearly PDF failed', error: err.message });
  }
});

// --- Daily Logs ---
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ message: '❌ Date query param required' });

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const items = await Item.find({ 'transactions.date': { $gte: start, $lte: end } });

    const logs = [];
    items.forEach(item => {
      (item.transactions || []).forEach(tx => {
        if (tx.date >= start && tx.date <= end) {
          logs.push({
            _id: tx._id,
            name: item.name,
            type: tx.type,
            quantity: tx.quantity,
            unitCostKsh: tx.unitCostKsh || 0,
            unitPriceKsh: tx.unitPriceKsh || 0,
            totalKsh: tx.totalKsh || 0,
            date: tx.date
          });
        }
      });
    });

    logs.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(logs);
    await logExport(req, 'json', 'daily', { date });
  } catch (err) {
    res.status(500).json({ message: '❌ Daily logs failed', error: err.message });
  }
});

module.exports = router;
