// backend/models/ExportLog.js
const mongoose = require('mongoose');

const exportLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['pdf', 'excel', 'csv', 'email'], required: true },
  format: { type: String, enum: ['summary', 'monthly'], default: 'summary' },
  params: { type: Object, default: {} }, // e.g., { year: 2026, month: 1 }
  ip: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('ExportLog', exportLogSchema);