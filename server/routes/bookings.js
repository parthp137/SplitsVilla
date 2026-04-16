import express from "express";
import { body } from "express-validator";
import Booking from "../models/Booking.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  [body("propertyId").notEmpty(), body("checkIn").isDate(), body("checkOut").isDate()],
  asyncHandler(async (req, res) => {
    const { propertyId, checkIn, checkOut, guests, tripId } = req.body;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const booking = new Booking({
      propertyId,
      guestId: req.userId,
      tripId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests,
      totalPrice: nights * 5000, // Placeholder price
      pricePerNight: 5000,
      status: "confirmed",
    });

    await booking.save();
    res.status(201).json(booking);
  })
);

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ guestId: req.userId }).populate("property");
  res.json(bookings);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("property");
  res.json(booking);
}));

router.delete("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
  res.json(booking);
}));

export default router;
