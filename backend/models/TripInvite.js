import mongoose from "mongoose";

const tripInviteSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    inviterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inviteeUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inviteeEmail: { type: String, required: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "revoked", "expired"],
      default: "pending",
    },
    token: { type: String },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

tripInviteSchema.index({ tripId: 1, inviteeEmail: 1, status: 1 });
tripInviteSchema.index({ inviteeUserId: 1, status: 1, createdAt: -1 });

export default mongoose.model("TripInvite", tripInviteSchema);
