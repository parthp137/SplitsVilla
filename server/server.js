import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CLIENT_URL || "http://localhost:8085";
console.log(`CORS Origin configured as: ${corsOrigin}`);

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

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

// Error handling
app.use(errorHandler);

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}\n`);
});
