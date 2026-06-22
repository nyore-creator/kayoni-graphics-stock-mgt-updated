// backend/models/ExportLog.js
const mongoose = require('mongoose');

const exportLogSchema = new mongoose.Schema({
  // 1. Changed required to false so guest/anonymous downloads don't crash the server
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, 
  type: { type: String, enum: ['pdf', 'excel', 'csv', 'email'], required: true },
  format: { type: String, enum: ['summary', 'monthly'], default: 'summary' },
  params: { type: Object, default: {} }, 
  ip: String,
  userAgent: String
}, { timestamps: true });

module.exports = mongoose.model('ExportLog', exportLogSchema);