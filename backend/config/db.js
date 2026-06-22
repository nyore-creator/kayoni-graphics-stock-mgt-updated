// backend/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // If we already have a connection, don't create a new one
    if (mongoose.connection.readyState >= 1) {
      console.log('✅ Using existing MongoDB connection');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,             // Maintain up to 10 parallel connections max
      minPoolSize: 2,              // Keep at least 2 connections alive at all times
      socketTimeoutMS: 45000,      // Close hanging queries after 45 seconds
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if the DB cluster is unreachable
      family: 4                    // Force IPv4 to avoid Render's DNS IPv6 resolution delays
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;