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

const parseList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const fallbackCoordinates = (seed) => {
  const hash = Array.from(seed || "property").reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
  return {
    lat: 20.5937 + ((hash % 300) - 150) * 0.01,
    lng: 78.9629 + ((hash % 500) - 250) * 0.01,
  };
};

const canViewProperty = (property, userId) => property.isActive || (userId && String(property.hostId) === String(userId));

const buildPropertyData = (body, user, existingProperty = null) => {
  const type = body.type || body.propertyType || existingProperty?.type || "villa";
  const title = body.title || body.propertyTitle || existingProperty?.title;
  const address = body.location?.address || body.address || existingProperty?.location?.address || "";
  const city = body.location?.city || body.city || existingProperty?.location?.city;
  const country = body.location?.country || body.country || existingProperty?.location?.country || "India";
  const coordinates = fallbackCoordinates(`${city || "city"}-${title || "property"}-${String(user._id)}`);

  return {
    hostId: existingProperty?.hostId || user._id,
    hostName: existingProperty?.hostName || user.name,
    hostAvatar: existingProperty?.hostAvatar || user.avatar || "",
    title,
    description: body.description ?? existingProperty?.description ?? "",
    type,
    location: {
      address,
      city,
      country,
      lat: body.location?.lat ?? existingProperty?.location?.lat ?? coordinates.lat,
      lng: body.location?.lng ?? existingProperty?.location?.lng ?? coordinates.lng,
    },
    images: parseList(body.images || body.imageUrls || existingProperty?.images || []),
    pricePerNight: Number(body.pricePerNight ?? body.nightlyPrice ?? existingProperty?.pricePerNight ?? 0),
    maxGuests: Number(body.maxGuests ?? existingProperty?.maxGuests ?? 0),
    bedrooms: Number(body.bedrooms ?? existingProperty?.bedrooms ?? 0),
    bathrooms: Number(body.bathrooms ?? existingProperty?.bathrooms ?? 0),
    beds: Number(body.beds ?? existingProperty?.beds ?? Math.max(1, Number(body.bedrooms ?? existingProperty?.bedrooms ?? 1))),
    amenities: parseList(body.amenities || existingProperty?.amenities || []),
    rules: {
      checkInTime: body.rules?.checkInTime || body.checkInTime || existingProperty?.rules?.checkInTime || "14:00",
      checkOutTime: body.rules?.checkOutTime || body.checkOutTime || existingProperty?.rules?.checkOutTime || "11:00",
      smokingAllowed: body.rules?.smokingAllowed ?? body.allowSmoking ?? existingProperty?.rules?.smokingAllowed ?? false,
      petsAllowed: body.rules?.petsAllowed ?? body.allowPets ?? existingProperty?.rules?.petsAllowed ?? true,
      partiesAllowed: body.rules?.partiesAllowed ?? body.allowParties ?? existingProperty?.rules?.partiesAllowed ?? false,
    },
    isFeatured: body.isFeatured ?? existingProperty?.isFeatured ?? false,
    isActive: existingProperty?.isActive ?? body.isActive ?? true,
  };
};

const requireHostOwnership = (property, userId) => {
  if (!property) {
    return { ok: false, status: 404, message: "Property not found" };
  }

  if (String(property.hostId) !== String(userId)) {
    return { ok: false, status: 403, message: "Not authorized to manage this property" };
  }

  return { ok: true };
};

const hydratePropertyForResponse = async (property, userId = null) => {
  if (!property) {
    return null;
  }

  if (canViewProperty(property, userId)) {
    return property;
  }

  return null;
};

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
    filters.isActive = true;

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
    const visibleProperties = properties.filter((property) => canViewProperty(property, req.userId));
    res.json(visibleProperties);
  })
);

router.get("/wishlist", authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate("wishlist");
  const visibleWishlist = (user.wishlist || []).filter((property) => property && canViewProperty(property, req.userId));
  res.json(visibleWishlist);
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

router.get("/host/properties", authMiddleware, asyncHandler(async (req, res) => {
  const properties = await Property.find({ hostId: req.userId }).sort({ createdAt: -1 });
  res.json(properties);
}));

router.get("/host/stats", authMiddleware, asyncHandler(async (req, res) => {
  const properties = await Property.find({ hostId: req.userId }).select("_id rating reviewCount isActive");
  const propertyIds = properties.map((property) => property._id);
  const bookings = propertyIds.length
    ? await Booking.find({ propertyId: { $in: propertyIds }, status: { $ne: "cancelled" } }).select("totalPrice")
    : [];

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const ratedProperties = properties.filter((property) => property.reviewCount > 0);
  const avgRating = ratedProperties.length
    ? ratedProperties.reduce((sum, property) => sum + (property.rating || 0), 0) / ratedProperties.length
    : 0;

  res.json({
    totalListings: properties.length,
    totalBookings,
    totalRevenue,
    avgRating: Number(avgRating.toFixed(2)),
    activeListings: properties.filter((property) => property.isActive).length,
    archivedListings: properties.filter((property) => !property.isActive).length,
  });
}));

router.post("/host/properties", authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("_id name avatar");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const propertyData = buildPropertyData(req.body, user);
  if (!propertyData.title || !propertyData.location.city || propertyData.pricePerNight <= 0 || propertyData.maxGuests <= 0) {
    return res.status(400).json({ message: "Title, city, price, and guest capacity are required" });
  }

  const property = await Property.create(propertyData);
  res.status(201).json(property);
}));

router.put("/host/properties/:id", authMiddleware, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  const ownership = requireHostOwnership(property, req.userId);
  if (!ownership.ok) {
    return res.status(ownership.status).json({ message: ownership.message });
  }

  const user = await User.findById(req.userId).select("_id name avatar");
  const nextData = buildPropertyData(req.body, user, property);
  property.title = nextData.title;
  property.description = nextData.description;
  property.type = nextData.type;
  property.location = nextData.location;
  property.images = nextData.images;
  property.pricePerNight = nextData.pricePerNight;
  property.maxGuests = nextData.maxGuests;
  property.bedrooms = nextData.bedrooms;
  property.bathrooms = nextData.bathrooms;
  property.beds = nextData.beds;
  property.amenities = nextData.amenities;
  property.rules = nextData.rules;
  property.isFeatured = nextData.isFeatured;

  await property.save();
  res.json(property);
}));

router.patch("/host/properties/:id/archive", authMiddleware, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  const ownership = requireHostOwnership(property, req.userId);
  if (!ownership.ok) {
    return res.status(ownership.status).json({ message: ownership.message });
  }

  property.isActive = false;
  await property.save();
  res.json(property);
}));

router.patch("/host/properties/:id/restore", authMiddleware, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  const ownership = requireHostOwnership(property, req.userId);
  if (!ownership.ok) {
    return res.status(ownership.status).json({ message: ownership.message });
  }

  property.isActive = true;
  await property.save();
  res.json(property);
}));

router.get("/:id", optionalAuth, asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  const visibleProperty = await hydratePropertyForResponse(property, req.userId);
  if (!visibleProperty) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(visibleProperty);
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

export default router;
