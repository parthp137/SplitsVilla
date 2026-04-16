import express from "express";
import { body } from "express-validator";
import Property from "../models/Property.js";
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

router.get("/:id", asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json(property);
}));

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
