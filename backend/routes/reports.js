const express = require('express');
const router = express.Router();
const Item = require('../models/Item');       // adjust path if needed
const ExportLog = require('../models/ExportLog'); // for logging exports

// --- Summary route ---
router.get('/summary', async (req, res) => {
  try {
    const items = await Item.find();
    res.json({ message: '✅ Summary report placeholder', count: items.length });
    await logExport(req, 'json', 'summary');
  } catch (err) {
    res.status(500).json({ message: '❌ Summary report failed', error: err.message });
  }
});

// --- Monthly Report ---
router.get('/monthly', async (req, res) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

  const y = parseInt(year);
  const m = parseInt(month) - 1; // JS months are 0-indexed

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

  try {
    const items = await Item.find({});

    const monthlyData = items.map(item => {
      const monthTransactions = (item.transactions || []).filter(t =>
        t.date >= start && t.date <= end
      );

      const purchases = monthTransactions.filter(t => t.type === 'purchase');
      const sales = monthTransactions.filter(t => t.type === 'sale');

      const bought = purchases.reduce((sum, t) => sum + (t.quantity || 0), 0);
      const sold = sales.reduce((sum, t) => sum + (t.quantity || 0), 0);

      // Use totalKsh consistently
      const cost = purchases.reduce((sum, t) => sum + (t.totalKsh || 0), 0);
      const revenue = sales.reduce((sum, t) => sum + (t.totalKsh || 0), 0);

      const profit = revenue - cost;

      return {
        name: item.name,
        bought,
        sold,
        revenue,
        cost,
        profit,
        stockAtEnd: item.currentStock ?? 0
      };
    });

    const totals = {
      totalRevenue: monthlyData.reduce((sum, i) => sum + i.revenue, 0),
      totalCost: monthlyData.reduce((sum, i) => sum + i.cost, 0),
      totalProfit: monthlyData.reduce((sum, i) => sum + i.profit, 0),
      itemsWithActivity: monthlyData.filter(i => i.bought > 0 || i.sold > 0).length
    };

    res.json({
      period: {
        year: y,
        month: m + 1,
        label: `${start.toLocaleString('en-KE', { month: 'long', year: 'numeric' })}`
      },
      items: monthlyData,
      totals
    });

    await logExport(req, 'json', 'monthly', { year: y, month: m + 1 });
  } catch (err) {
    res.status(500).json({ message: '❌ Monthly report failed', error: err.message });
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

    // Sort logs by time
    logs.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(logs);
    await logExport(req, 'json', 'daily', { date });
  } catch (err) {
    res.status(500).json({ message: '❌ Daily logs failed', error: err.message });
  }
});

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

module.exports = router;
