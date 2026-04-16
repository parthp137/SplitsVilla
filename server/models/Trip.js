import mongoose from "mongoose";

const tripMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  email: String,
  avatar: String,
  role: { type: String, enum: ["organizer", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now },
  totalContributed: { type: Number, default: 0 },
});

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    destination: { type: String, required: true },
    country: String,
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: Number,
    groupSize: { type: Number, required: true },
    budgetPerPerson: Number,
    currency: { type: String, default: "INR" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [tripMemberSchema],
    status: { type: String, enum: ["planning", "active", "archived", "completed"], default: "planning" },
    finalizedProperty: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    inviteCode: { type: String, unique: true, sparse: true },
    totalExpenses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tripSchema.index({ createdBy: 1, status: 1 });
tripSchema.index({ inviteCode: 1 });

export default mongoose.model("Trip", tripSchema);
