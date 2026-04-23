import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostName: String,
    hostAvatar: String,
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ["villa", "apartment", "hotel", "hostel", "resort", "cottage"], required: true },
    location: {
      address: String,
      city: { type: String, required: true },
      country: String,
      lat: Number,
      lng: Number,
    },
    images: [String],
    pricePerNight: { type: Number, required: true },
    maxGuests: { type: Number, required: true },
    bedrooms: Number,
    bathrooms: Number,
    beds: Number,
    amenities: [String],
    rules: {
      checkInTime: String,
      checkOutTime: String,
      smokingAllowed: Boolean,
      petsAllowed: Boolean,
      partiesAllowed: Boolean,
    },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

propertySchema.index({ city: 1, pricePerNight: 1, rating: -1 });

export default mongoose.model("Property", propertySchema);
