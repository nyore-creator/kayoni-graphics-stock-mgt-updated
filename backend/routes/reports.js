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

// --- Helper: Fetch Detailed Sales Summary (Groups by Day/Month AND Item Name) ---
const getSalesSummary = async (start, end, groupBy = 'month') => {
  const timeFormat = groupBy === 'month' 
    ? { month: { $month: "$transactions.date" } } 
    : { day: { $dayOfMonth: "$transactions.date" } };
  
  return await Item.aggregate([
    { $unwind: "$transactions" },
    { $match: { 
        "transactions.type": "sale", 
        "transactions.date": { $gte: start, $lte: end } 
    }},
    { $group: {
        _id: { 
          time: timeFormat,
          name: "$name"
        },
        revenue: { $sum: "$transactions.totalKsh" },
        itemsSold: { $sum: "$transactions.quantity" }
    }},
    { $project: {
        _id: "$_id.time",
        itemName: "$_id.name",
        revenue: 1,
        itemsSold: 1
    }},
    { $sort: { "_id": 1, "itemName": 1 } }
  ]);
};

// --- Helper: Process Items Data (Calculates Live Stock & Inventory Value) ---
const processItemsData = (items, start, end) => {
  return items.map(item => {
    const txs = (item.transactions || []).filter(t => t.date >= start && t.date <= end);
    const purchases = txs.filter(t => t.type === 'purchase');
    const sales = txs.filter(t => t.type === 'sale');

    const bought = purchases.reduce((s, t) => s + (t.quantity || 0), 0);
    const sold = sales.reduce((s, t) => s + (t.quantity || 0), 0);
    const cost = purchases.reduce((s, t) => s + (t.totalKsh || 0), 0);
    const revenue = sales.reduce((s, t) => s + (t.totalKsh || 0), 0);
    
    // Live Stock Calculation
    const stockAtEnd = bought - sold;
    
    // Calculate buying price per unit to value the remaining stock
    // Uses the average cost from the current period or the item's base price
    const unitBuyingPrice = bought > 0 ? (cost / bought) : (item.buyingPrice || 0);
    const stockValue = stockAtEnd * unitBuyingPrice;

    return {
      name: item.name,
      bought,
      sold,
      revenue,
      cost,
      profit: revenue - cost,
      stockAtEnd,
      stockValue
    };
  });
};

// =======================
// DAILY LOGS ROUTE
// =======================
router.get('/daily', async (req, res) => {
  const { date } = req.query;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  try {
    const items = await Item.find({ "transactions.date": { $gte: start, $lte: end } });
    const logs = [];
    items.forEach(item => {
      item.transactions
        .filter(t => t.date >= start && t.date <= end)
        .forEach(t => {
          logs.push({
            itemName: item.name,
            type: t.type,
            quantity: t.quantity,
            totalKsh: t.totalKsh,
            date: t.date,
            note: t.note
          });
        });
    });
    res.json(logs.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (err) {
    res.status(500).json({ message: '❌ Daily logs failed', error: err.message });
  }
});

// =======================
// MONTHLY ROUTES
// =======================
router.get('/monthly', async (req, res) => {
  const { year, month } = req.query;
  const start = new Date(parseInt(year), parseInt(month) - 1, 1);
  const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  try {
    const items = await Item.find({});
    const monthlyData = processItemsData(items, start, end);
    res.json({
      period: { label: start.toLocaleString('en-KE', { month: 'long', year: 'numeric' }) },
      items: monthlyData,
      totals: {
        totalRevenue: monthlyData.reduce((s, i) => s + i.revenue, 0),
        totalCost: monthlyData.reduce((s, i) => s + i.cost, 0),
        totalProfit: monthlyData.reduce((s, i) => s + i.profit, 0),
        stockValue: monthlyData.reduce((s, i) => s + (i.stockValue || 0), 0),
        itemsWithActivity: monthlyData.filter(i => i.bought > 0 || i.sold > 0).length
      }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Monthly data failed', error: err.message });
  }
});

router.get('/monthly/pdf', async (req, res) => {
  const { year, month } = req.query;
  const start = new Date(parseInt(year), parseInt(month) - 1, 1);
  const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  try {
    const items = await Item.find({});
    const salesSummary = await getSalesSummary(start, end, 'day');
    const monthlyData = processItemsData(items, start, end);
    
    const totals = {
      totalRevenue: monthlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: monthlyData.reduce((s, i) => s + i.cost, 0),
      stockValue: monthlyData.reduce((s, i) => s + (i.stockValue || 0), 0)
    };

    generateReportPDF(`Monthly_Report_${year}_${month}`, start.toLocaleString('en-KE', { month: 'long', year: 'numeric' }), monthlyData, totals, salesSummary, res);
    await logExport(req, 'pdf', 'monthly', { year, month });
  } catch (err) {
    res.status(500).json({ message: '❌ Monthly PDF failed', error: err.message });
  }
});

// =======================
// YEARLY ROUTES
// =======================
router.get('/yearly', async (req, res) => {
  const { year } = req.query;
  const start = new Date(parseInt(year), 0, 1);
  const end = new Date(parseInt(year), 11, 31, 23, 59, 59);

  try {
    const items = await Item.find({});
    const yearlyData = processItemsData(items, start, end);
    res.json({
      period: { label: year.toString() },
      items: yearlyData,
      totals: {
        totalRevenue: yearlyData.reduce((s, i) => s + i.revenue, 0),
        totalCost: yearlyData.reduce((s, i) => s + i.cost, 0),
        totalProfit: yearlyData.reduce((s, i) => s + i.profit, 0),
        stockValue: yearlyData.reduce((s, i) => s + (i.stockValue || 0), 0),
        itemsWithActivity: yearlyData.filter(i => i.bought > 0 || i.sold > 0).length
      }
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Yearly data failed', error: err.message });
  }
});

router.get('/yearly/pdf', async (req, res) => {
  const { year } = req.query;
  const start = new Date(parseInt(year), 0, 1);
  const end = new Date(parseInt(year), 11, 31, 23, 59, 59);

  try {
    const items = await Item.find({});
    const salesSummary = await getSalesSummary(start, end, 'month');
    const yearlyData = processItemsData(items, start, end);
    
    const totals = {
      totalRevenue: yearlyData.reduce((s, i) => s + i.revenue, 0),
      totalCost: yearlyData.reduce((s, i) => s + i.cost, 0),
      stockValue: yearlyData.reduce((s, i) => s + (i.stockValue || 0), 0)
    };

    generateReportPDF(`Yearly_Report_${year}`, year.toString(), yearlyData, totals, salesSummary, res);
    await logExport(req, 'pdf', 'yearly', { year });
  } catch (err) {
    res.status(500).json({ message: '❌ Yearly PDF failed', error: err.message });
  }
});

module.exports = router;