import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import config from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import propertiesRoutes from "./routes/properties.js";
import bookingsRoutes from "./routes/bookings.js";
import tripsRoutes from "./routes/trips.js";
import votesRoutes from "./routes/votes.js";
import notificationsRoutes from "./routes/notifications.js";
import currencyRoutes from "./routes/currency.js";
import aiRoutes from "./routes/ai.js";
import usersRoutes from "./routes/users.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

// Trust reverse proxy (Render load balancer / Cloudflare)
app.set("trust proxy", 1);

// Hardened flat query parser (prevents object parsing in queries like ?city[$ne]=x)
app.set("query parser", "simple");

// Security headers
app.use(helmet());

// Exact-match CORS configuration (no wildcards, credentials: false)
const allowedOrigins = config.CLIENT_URLS_ARRAY;
console.log(`CORS allowed origins: [${allowedOrigins.join(", ")}]`);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body limit: 4MB for Base64 image payload tolerance
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "4mb" }));

// General rate limiter on all /api endpoints
app.use("/api", apiLimiter);

// MongoDB connection with timeouts and lifecycle listeners
mongoose.connection.on("error", (err) => {
  console.error("✗ MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("! MongoDB disconnected");
});

const connectWithRetry = async (delay = 2000, maxDelay = 30000) => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✓ MongoDB connected successfully");
  } catch (err) {
    console.error(
      `✗ MongoDB initial connection failed (${err.message}). Retrying in ${delay / 1000}s...`
    );
    setTimeout(() => {
      connectWithRetry(Math.min(delay * 2, maxDelay), maxDelay);
    }, delay);
  }
};

connectWithRetry();

// Health check endpoints
// 1. Cheap health check (no DB ping, fast for load balancers)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 2. Database health check
app.get("/api/health/db", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return res.json({ status: "ok", db: "connected" });
  }
  return res.status(503).json({
    status: "error",
    db: "disconnected",
    readyState: mongoose.connection.readyState,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/trips", votesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/analytics", analyticsRoutes);

// JSON 404 for unknown /api/* routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Non-API 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler (must be last middleware)
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${config.PORT}\n`);
});

export default app;
