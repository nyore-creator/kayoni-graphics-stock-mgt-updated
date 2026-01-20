const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['purchase', 'sale'], required: true },
  quantity: { type: Number, required: true },
  unitCostKsh: { type: Number, default: 0 },   // cost per unit (for purchases)
  unitPriceKsh: { type: Number, default: 0 },  // selling price per unit (for sales)
  totalKsh: { type: Number, required: true },  // total transaction value
  date: { type: Date, default: Date.now }
});

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  transactions: [transactionSchema]
}, { timestamps: true });

// --- Virtuals for computed fields ---
itemSchema.virtual('quantityBought').get(function () {
  return (this.transactions || [])
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + (t.quantity || 0), 0);
});

itemSchema.virtual('quantitySold').get(function () {
  return (this.transactions || [])
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.quantity || 0), 0);
});

itemSchema.virtual('currentStock').get(function () {
  return this.quantityBought - this.quantitySold;
});

itemSchema.virtual('amountBoughtKsh').get(function () {
  return (this.transactions || [])
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + (t.totalKsh || 0), 0);
});

itemSchema.virtual('amountSoldKsh').get(function () {
  return (this.transactions || [])
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.totalKsh || 0), 0);
});

itemSchema.virtual('profitKsh').get(function () {
  // Safer: profit = revenue - cost
  return this.amountSoldKsh - this.amountBoughtKsh;
});

// Ensure virtuals appear in JSON
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
