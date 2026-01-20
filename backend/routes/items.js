const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); // adjust path if your model is elsewhere

// --- POST: Add purchase or sale transaction ---
router.post('/', async (req, res) => {
  try {
    const { name, quantity, unitCostKsh = 0, unitPriceKsh = 0, type } = req.body;

    // Basic validation
    if (!name || !quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: '❌ Name & quantity > 0 required' });
    }

    if (!['purchase', 'sale'].includes(type)) {
      return res.status(400).json({ message: '❌ type must be "purchase" or "sale"' });
    }

    // Case-insensitive lookup
    let item = await Item.findOne({ name: new RegExp(`^${name}$`, 'i') });

    // Ensure numeric values
    const qty = Number(quantity);
    const cost = Number(unitCostKsh);
    const price = Number(unitPriceKsh);

    // Calculate totalKsh automatically
    let totalKsh = type === 'purchase' ? cost * qty : price * qty;

    if (isNaN(totalKsh)) {
      return res.status(400).json({ message: '❌ Invalid cost/price values' });
    }

    const transaction = {
      type,
      quantity: qty,
      unitCostKsh: type === 'purchase' ? cost : 0,
      unitPriceKsh: type === 'sale' ? price : 0,
      totalKsh,
      date: new Date()
    };

    console.log('💾 Transaction payload:', transaction);

    if (!item) {
      // New items can only be created via purchase
      if (type === 'sale') {
        return res.status(400).json({ message: '❌ New items can only be added via purchase' });
      }
      item = new Item({ name, transactions: [transaction] });
    } else {
      // Check stock before sale
      if (type === 'sale' && item.currentStock < qty) {
        return res.status(400).json({
          message: `❌ Insufficient stock. Available: ${item.currentStock}`
        });
      }
      item.transactions.push(transaction);
    }

    await item.save();

    res.status(201).json({
      message: '✅ Transaction recorded',
      item,
      transaction // return the transaction for frontend confirmation
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: '❌ Item name already exists' });
    }
    console.error('❌ Save failed:', err);
    res.status(500).json({ message: '❌ Save failed', error: err.message });
  }
});

// --- GET: fetch all items ---
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error('❌ Fetch failed:', err);
    res.status(500).json({ message: '❌ Fetch failed', error: err.message });
  }
});

module.exports = router;
