import express from "express";
import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import TripInvite from "../models/TripInvite.js";
import Notification from "../models/Notification.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { generateInviteCode, generateToken } from "../utils/helpers.js";
import { settleExpenses } from "../utils/algorithms.js";

const router = express.Router();

const isTripOrganizer = (trip, userId) => trip.createdBy.toString() === userId;

const markExpiredInviteIfNeeded = async (invite) => {
  if (invite.status === "pending" && invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    invite.status = "expired";
    await invite.save();
    return true;
  }
  return false;
};

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
  const isMember = trip.members.some((member) => member.userId.toString() === req.userId);
  if (!isMember) {
    return res.status(403).json({ message: "You do not have access to this trip" });
  }
  res.json(trip);
}));

router.get(
  "/:id/invites",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (!isTripOrganizer(trip, req.userId)) {
      return res.status(403).json({ message: "Only organizer can view trip invites" });
    }

    const invites = await TripInvite.find({ tripId: trip._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(invites);
  })
);

router.post(
  "/:id/invites",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (!isTripOrganizer(trip, req.userId)) {
      return res.status(403).json({ message: "Only organizer can invite collaborators" });
    }

    const rawEmail = (req.body.email || "").toString().trim().toLowerCase();
    if (!rawEmail || !rawEmail.includes("@")) {
      return res.status(400).json({ message: "Valid invite email is required" });
    }

    const existingMember = trip.members.find((m) => m.email?.toLowerCase() === rawEmail);
    if (existingMember) {
      return res.status(400).json({ message: "User is already a trip member" });
    }

    const pendingCount = await TripInvite.countDocuments({ tripId: trip._id, status: "pending" });
    if (trip.members.length + pendingCount >= trip.groupSize) {
      return res.status(400).json({ message: "Trip member limit reached" });
    }

    const pendingInvite = await TripInvite.findOne({ tripId: trip._id, inviteeEmail: rawEmail, status: "pending" });
    if (pendingInvite) {
      await markExpiredInviteIfNeeded(pendingInvite);
      if (pendingInvite.status === "pending") {
        return res.status(400).json({ message: "Pending invite already exists for this email" });
      }
    }

    const inviteeUser = await User.findOne({ email: rawEmail }).select("_id name email");
    const invite = await TripInvite.create({
      tripId: trip._id,
      inviterId: req.userId,
      inviteeUserId: inviteeUser?._id,
      inviteeEmail: rawEmail,
      token: generateInviteCode(),
    });

    if (inviteeUser) {
      await Notification.create({
        userId: inviteeUser._id,
        tripId: trip._id,
        type: "member",
        message: `You were invited to join \"${trip.title}\"`,
        link: `/trips/${trip._id}`,
      });
    }

    res.status(201).json(invite);
  })
);

router.post(
  "/invites/:inviteId/respond",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const action = (req.body.action || "").toString();
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const invite = await TripInvite.findById(req.params.inviteId);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    await markExpiredInviteIfNeeded(invite);
    if (invite.status !== "pending") {
      return res.status(400).json({ message: `Invite is already ${invite.status}` });
    }

    const user = await User.findById(req.userId).select("_id name email avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isInvitee =
      (invite.inviteeUserId && invite.inviteeUserId.toString() === req.userId) ||
      invite.inviteeEmail === user.email.toLowerCase();
    if (!isInvitee) {
      return res.status(403).json({ message: "You are not allowed to respond to this invite" });
    }

    const trip = await Trip.findById(invite.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (action === "accept") {
      const alreadyMember = trip.members.find((m) => m.userId.toString() === req.userId);
      if (!alreadyMember) {
        if (trip.members.length >= trip.groupSize) {
          return res.status(400).json({ message: "Trip member limit reached" });
        }

        trip.members.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: "member",
        });
        await trip.save();
      }
      invite.status = "accepted";
    } else {
      invite.status = "declined";
    }

    await invite.save();
    res.json({ invite, tripId: trip._id });
  })
);

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
  "/:tripId/properties",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { propertyId } = req.body;
    const savedPropertyId = (propertyId || "").toString().trim();
    if (!savedPropertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const isMember = trip.members.some((member) => member.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: "You must be part of the trip to save properties" });
    }

    trip.savedProperties = trip.savedProperties || [];
    const alreadySaved = trip.savedProperties.some((saved) => saved.propertyId.toString() === savedPropertyId);

    if (!alreadySaved) {
      trip.savedProperties.push({ propertyId: savedPropertyId, addedBy: req.userId });
      await trip.save();
    }

    res.json(trip);
  })
);

router.post(
  "/:tripId/expenses",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { description, amount, category, currency, paidBy, splitWith, receipt } = req.body;
    const expense = new Expense({
      tripId: req.params.tripId,
      description,
      amount,
      category,
      currency,
      paidBy,
      paidByName: (await User.findById(paidBy)).name,
      splitAmong: splitWith,
      receipt,
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
