import mongoose from "mongoose";

const tripHistorySchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: String,
    checkIn: Date,
    checkOut: Date,
    nights: Number,
    totalSpent: Number,
    participants: Number,
    notes: String,
    photos: [String],
  },
  { timestamps: true }
);

tripHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("TripHistory", tripHistorySchema);
