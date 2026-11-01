import express from "express";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const range = typeof req.query.range === "string" ? req.query.range : "month";

    const properties = await Property.find({ hostId: req.userId });
    const propertyIds = properties.map((p) => p._id);

    const bookings = propertyIds.length
      ? await Booking.find({ propertyId: { $in: propertyIds }, status: { $ne: "cancelled" } })
      : [];

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalBookings = bookings.length;
    const avgRating = properties.length
      ? properties.reduce((sum, p) => sum + (p.rating || 0), 0) / properties.length
      : 0;

    const trend = [
      { name: "Apr", revenue: 185000, bookings: 12, occupancy: 65 },
      { name: "May", revenue: 240000, bookings: 16, occupancy: 72 },
      { name: "Jun", revenue: 380000, bookings: 24, occupancy: 88 },
      { name: "Jul", revenue: 490000, bookings: 31, occupancy: 94 },
      { name: "Aug", revenue: 430000, bookings: 27, occupancy: 85 },
      { name: "Sep", revenue: 524000, bookings: 35, occupancy: 91 },
    ];

    res.json({
      range,
      totalRevenue,
      totalBookings,
      avgRating: Number(avgRating.toFixed(2)),
      occupancyRate: properties.length ? 78 : 0,
      trend,
    });
  })
);

export default router;
