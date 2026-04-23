import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    category: { type: String, enum: ["food", "transport", "activity", "accommodation", "shopping", "other"], required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paidByName: String,
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    receipt: String,
  },
  { timestamps: true }
);

expenseSchema.index({ tripId: 1, createdAt: -1 });

export default mongoose.model("Expense", expenseSchema);
