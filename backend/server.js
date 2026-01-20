// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Routes
const itemsRouter = require('./routes/items');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/reports', reportsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ Kayoni Graphics API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
// server.js
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);