import express from "express";
import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { generateInviteCode, generateToken } from "../utils/helpers.js";
import { settleExpenses } from "../utils/algorithms.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { title, destination, country, checkIn, checkOut, groupSize, budgetPerPerson, currency } = req.body;
    const inviteCode = generateInviteCode();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const user = await User.findById(req.userId);
    const trip = new Trip({
      title,
      destination,
      country,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      groupSize,
      budgetPerPerson,
      currency,
      createdBy: req.userId,
      inviteCode,
      members: [{ userId: req.userId, name: user.name, email: user.email, avatar: user.avatar, role: "organizer" }],
    });

    await trip.save();
    res.status(201).json(trip);
  })
);

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const trips = await Trip.find({ "members.userId": req.userId });
  res.json(trips);
}));

router.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json(trip);
}));

router.post(
  "/join-code",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { code } = req.body;
    const trip = await Trip.findOne({ inviteCode: code });
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const user = await User.findById(req.userId);
    if (!trip.members.find((m) => m.userId.equals(req.userId))) {
      trip.members.push({ userId: req.userId, name: user.name, email: user.email, avatar: user.avatar });
      await trip.save();
    }

    res.json(trip);
  })
);

router.post(
  "/:tripId/expenses",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { description, amount, category, currency, paidBy, splitWith } = req.body;
    const expense = new Expense({
      tripId: req.params.tripId,
      description,
      amount,
      category,
      currency,
      paidBy,
      paidByName: (await User.findById(paidBy)).name,
      splitAmong: splitWith,
    });

    await expense.save();
    await Trip.findByIdAndUpdate(req.params.tripId, { $inc: { totalExpenses: amount } });
    res.status(201).json(expense);
  })
);

router.get("/:tripId/expenses", asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ tripId: req.params.tripId });
  res.json(expenses);
}));

router.post(
  "/:tripId/expenses/settle",
  asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.tripId);
    const expenses = await Expense.find({ tripId: req.params.tripId });
    const memberIds = trip.members.map((m) => m.userId.toString());
    const settlements = settleExpenses(expenses, memberIds);
    res.json({ settlements });
  })
);

export default router;
