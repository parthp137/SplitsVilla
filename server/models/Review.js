import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    guestName: String,
    guestAvatar: String,
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      accuracy: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      checkin: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
    hostReply: String,
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
