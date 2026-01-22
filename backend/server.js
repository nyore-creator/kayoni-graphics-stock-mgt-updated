// backend/server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // ✅ restrict origin if needed
app.use(express.json());

// Connect DB
connectDB();

// Routers
const itemsRouter = require("./routes/items");
const reportsRouter = require("./routes/reports");
const authRouter = require("./routes/auth");

// ✅ JWT middleware
const authMiddleware = require("./middleware/authMiddleware");

// Routes
app.use("/api/auth", authRouter); // public login route

// ✅ Protect items and reports with JWT
app.use("/api/items", authMiddleware, itemsRouter);
app.use("/api/reports", authMiddleware, reportsRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "✅ Kayoni Graphics API is running" });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
