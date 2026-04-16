import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vote: { type: String, enum: ["up", "down"], required: true },
  },
  { timestamps: true }
);

voteSchema.index({ tripId: 1, propertyId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
