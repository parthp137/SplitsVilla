import express from "express";
import { body } from "express-validator";
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import Trip from "../models/Trip.js";
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
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const isTripMember = trip.members.some((member) => member.userId.toString() === req.userId);
      if (!isTripMember) {
        return res.status(403).json({ message: "You must be a trip member to attach a booking" });
      }
    }

    const baseTotal = nights * property.pricePerNight;
    const cleaningFee = 1500;
    const serviceFee = Math.round(baseTotal * 0.05);
    const totalPrice = baseTotal + cleaningFee + serviceFee;

    const booking = new Booking({
      propertyId,
      guestId: req.userId,
      tripId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests,
      totalPrice,
      pricePerNight: property.pricePerNight,
      status: "confirmed",
    });

    await booking.save();
    res.status(201).json(booking);
  })
);

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ guestId: req.userId })
    .populate("propertyId")
    .populate("tripId")
    .sort({ createdAt: -1 });
  res.json(bookings);
}));

router.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("propertyId").populate("tripId");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (String(booking.guestId) !== String(req.userId)) {
    return res.status(403).json({ message: "Not authorized to view this booking" });
  }
  res.json(booking);
}));

router.delete("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (String(booking.guestId) !== String(req.userId)) {
    return res.status(403).json({ message: "Not authorized to cancel this booking" });
  }
  booking.status = "cancelled";
  await booking.save();
  res.json(booking);
}));

export default router;
