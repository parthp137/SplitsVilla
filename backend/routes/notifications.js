import express from "express";
import Notification from "../models/Notification.js";
import Trip from "../models/Trip.js";
import TripInvite from "../models/TripInvite.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

const ensureOrganizerInMembers = async (trip) => {
  const organizerExists = trip.members.some(
    (member) => member.userId && member.userId.toString() === trip.createdBy.toString(),
  );

  if (organizerExists) {
    return false;
  }

  const organizer = await User.findById(trip.createdBy).select("_id name email avatar");
  if (!organizer) {
    return false;
  }

  trip.members.unshift({
    userId: organizer._id,
    name: organizer.name,
    email: organizer.email,
    avatar: organizer.avatar,
    role: "organizer",
  });
  await trip.save();
  return true;
};

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
  res.json(notifications);
}));

router.get("/:id/trip-preview", authMiddleware, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.userId });
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  if (!notification.tripId) {
    return res.status(400).json({ message: "This notification is not linked to a trip" });
  }

  const trip = await Trip.findById(notification.tripId);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  await ensureOrganizerInMembers(trip);

  const isMember = trip.members.some((member) => member.userId.toString() === req.userId);
  let inviteExpiresAt = null;

  if (!isMember) {
    const user = await User.findById(req.userId).select("email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pendingInvite = await TripInvite.findOne({
      tripId: trip._id,
      status: "pending",
      $or: [
        { inviteeUserId: req.userId },
        { inviteeEmail: user.email.toLowerCase() },
      ],
    }).sort({ createdAt: -1 });

    if (!pendingInvite) {
      return res.status(403).json({ message: "You do not have a pending invite for this trip" });
    }

    if (pendingInvite.expiresAt && pendingInvite.expiresAt.getTime() < Date.now()) {
      pendingInvite.status = "expired";
      await pendingInvite.save();
      return res.status(400).json({ message: "This invite has expired" });
    }

    inviteExpiresAt = pendingInvite.expiresAt;
  }

  res.json({
    trip: {
      id: trip._id,
      title: trip.title,
      destination: trip.destination,
      country: trip.country,
      checkIn: trip.checkIn,
      checkOut: trip.checkOut,
      nights: trip.nights,
      groupSize: trip.groupSize,
      currentMembers: trip.members.length,
      budgetPerPerson: trip.budgetPerPerson,
      currency: trip.currency,
      status: trip.status,
    },
    alreadyMember: isMember,
    inviteExpiresAt,
  });
}));

router.patch("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  res.json(notif);
}));

router.post("/mark-all-read", authMiddleware, asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ userId: req.userId }, { isRead: true });
  res.json({ count: result.modifiedCount });
}));

router.post("/:id/join-trip", authMiddleware, asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.userId });
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  if (!notification.tripId) {
    return res.status(400).json({ message: "This notification is not linked to a trip invite" });
  }

  const trip = await Trip.findById(notification.tripId);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  await ensureOrganizerInMembers(trip);

  const alreadyMember = trip.members.some((member) => member.userId.toString() === req.userId);
  if (alreadyMember) {
    const user = await User.findById(req.userId).select("_id name email avatar");
    if (user) {
      const reconciled = await TripInvite.findOne({
        tripId: trip._id,
        status: "pending",
        $or: [
          { inviteeUserId: req.userId },
          { inviteeEmail: user.email.toLowerCase() },
        ],
      }).sort({ createdAt: -1 });

      if (reconciled) {
        reconciled.status = "accepted";
        if (!reconciled.inviteeUserId) {
          reconciled.inviteeUserId = user._id;
        }
        await reconciled.save();
      }
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }
    return res.json({ tripId: trip._id, joined: false, alreadyMember: true });
  }

  const user = await User.findById(req.userId).select("_id name email avatar");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const pendingInvite = await TripInvite.findOne({
    tripId: trip._id,
    status: "pending",
    $or: [
      { inviteeUserId: req.userId },
      { inviteeEmail: user.email.toLowerCase() },
    ],
  }).sort({ createdAt: -1 });

  if (!pendingInvite) {
    return res.status(403).json({ message: "No pending invite found for your account" });
  }

  if (pendingInvite.expiresAt && pendingInvite.expiresAt.getTime() < Date.now()) {
    pendingInvite.status = "expired";
    await pendingInvite.save();
    return res.status(400).json({ message: "This invite has expired" });
  }

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

  pendingInvite.status = "accepted";
  if (!pendingInvite.inviteeUserId) {
    pendingInvite.inviteeUserId = user._id;
  }
  await pendingInvite.save();

  notification.isRead = true;
  notification.link = `/trips/${trip._id}`;
  await notification.save();

  res.json({ tripId: trip._id, joined: true, alreadyMember: false });
}));

export default router;
