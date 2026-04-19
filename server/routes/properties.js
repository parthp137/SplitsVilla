import express from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import Property from "../models/Property.js";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { city, priceMin, priceMax, type, rating } = req.query;
    const filters = {};

    if (city) filters["location.city"] = new RegExp(city, "i");
    if (priceMin || priceMax) {
      filters.pricePerNight = {};
      if (priceMin) filters.pricePerNight.$gte = parseInt(priceMin);
      if (priceMax) filters.pricePerNight.$lte = parseInt(priceMax);
    }
    if (type) filters.type = type;
    if (rating) filters.rating = { $gte: parseFloat(rating) };

    const properties = await Property.find(filters).limit(50);
    res.json(properties);
  })
);

router.get(
  "/batch",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const ids = (req.query.ids || "")
      .toString()
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const mongoIds = ids.filter((id) => mongoose.isValidObjectId(id));

    if (!mongoIds.length) {
      return res.json([]);
    }

    const properties = await Property.find({ _id: { $in: mongoIds } }).limit(100);
    res.json(properties);
  })
);

router.get("/:id", asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json(property);
}));

router.get("/:id/reviews", asyncHandler(async (req, res) => {
  const reviews = await Review.find({ propertyId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(reviews);
}));

router.post(
  "/:id/reviews",
  authMiddleware,
  [
    body("bookingId").notEmpty(),
    body("rating").isFloat({ min: 1, max: 5 }),
    body("comment").optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const { bookingId, rating, comment, categories } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (String(booking.guestId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized to review this booking" });
    }

    if (String(booking.propertyId) !== String(req.params.id)) {
      return res.status(400).json({ message: "Booking does not belong to this property" });
    }

    const existingReview = await Review.findOne({ bookingId, guestId: req.userId });
    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted for this booking" });
    }

    const user = await User.findById(req.userId);

    const review = await Review.create({
      propertyId: req.params.id,
      bookingId,
      guestId: req.userId,
      guestName: user?.name || "Guest",
      guestAvatar: user?.avatar || "",
      hostId: undefined,
      rating,
      comment,
      categories,
    });

    const stats = await Review.aggregate([
      { $match: { propertyId: review.propertyId } },
      {
        $group: {
          _id: "$propertyId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Property.findByIdAndUpdate(review.propertyId, {
        rating: Number(stats[0].avgRating.toFixed(2)),
        reviewCount: stats[0].count,
      });
    }

    res.status(201).json(review);
  })
);

router.post("/wishlist/add", authMiddleware, asyncHandler(async (req, res) => {
  const { propertyId } = req.body;
  const user = await User.findByIdAndUpdate(req.userId, { $addToSet: { wishlist: propertyId } }, { new: true });
  res.json(user);
}));

router.post("/wishlist/remove", authMiddleware, asyncHandler(async (req, res) => {
  const { propertyId } = req.body;
  const user = await User.findByIdAndUpdate(req.userId, { $pull: { wishlist: propertyId } }, { new: true });
  res.json(user);
}));

router.get("/wishlist", authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate("wishlist");
  res.json(user.wishlist || []);
}));

export default router;
