import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import propertiesRoutes from "./routes/properties.js";
import bookingsRoutes from "./routes/bookings.js";
import tripsRoutes from "./routes/trips.js";
import votesRoutes from "./routes/votes.js";
import notificationsRoutes from "./routes/notifications.js";
import currencyRoutes from "./routes/currency.js";
import aiRoutes from "./routes/ai.js";
import usersRoutes from "./routes/users.js";

import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Middleware
const configuredOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultLocalOrigins = ["http://localhost:8080", "http://localhost:8082", "http://localhost:5173"];
const allowedOrigins = [...new Set([...configuredOrigins, ...defaultLocalOrigins])];
console.log(
  `CORS Origins configured as: ${allowedOrigins.length ? allowedOrigins.join(", ") : "* (all)"}`,
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header).
    if (!origin) {
      callback(null, true);
      return;
    }

    // If no origins are configured, allow all browser origins.
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/splitsvilla")
  .then(() => console.log("✓ MongoDB connected"))
  .catch((err) => console.error("✗ MongoDB error:", err.message));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/trips", votesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", usersRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

if (isProduction) {
  app.use(express.static(frontendDistPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Error handling
app.use(errorHandler);

// 404
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ message: "Route not found" });
    return;
  }

  res.status(404).send("Not found");
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}\n`);
});
