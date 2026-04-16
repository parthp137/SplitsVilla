import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: Number,
    guests: Number,
    totalPrice: { type: Number, required: true },
    pricePerNight: Number,
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    specialRequests: String,
  },
  { timestamps: true }
);

bookingSchema.index({ guestId: 1, status: 1 });
bookingSchema.index({ propertyId: 1, checkIn: 1, checkOut: 1 });

export default mongoose.model("Booking", bookingSchema);
