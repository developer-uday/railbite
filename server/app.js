import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import connectDB from "./config/db.config.js";
import migratePasswordsToHash from "./utils/migratePasswords.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import trainRoutes from "./routes/trainRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
// Configure CORS: allow origins from env or default dev origin, support credentials
// Prefer `CORS_ORIGINS` (comma-separated) or fall back to `CLIENT_URL` from .env
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://railbite.vercel.app']
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Note: global `cors()` above handles preflight for configured origins.
// Avoid calling `app.options('*', ...)` because some path-to-regexp versions reject '*' as a path.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Run password migration on startup
console.log("🔐 Checking for plain text passwords to migrate...");
migratePasswordsToHash();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/train", trainRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "RAILBITE Server is running", status: "ok" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === "development" ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚂 RAILBITE Server running on port ${PORT}`);
});
