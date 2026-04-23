import express from "express";
import Vote from "../models/Vote.js";
import Trip from "../models/Trip.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post(
  "/:tripId/votes",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { propertyId, voteType } = req.body;
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const isMember = trip.members.some((member) => member.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: "You must be a trip member to vote" });
    }

    const normalizedPropertyId = (propertyId || "").toString().trim();
    if (!normalizedPropertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    let vote = await Vote.findOne({ tripId, propertyId: normalizedPropertyId, userId: req.userId });
    if (vote) {
      vote.vote = voteType;
      await vote.save();
    } else {
      vote = new Vote({ tripId, propertyId: normalizedPropertyId, userId: req.userId, vote: voteType });
      await vote.save();
    }

    res.json(vote);
  })
);

router.get(
  "/:tripId/votes/summary",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const isMember = trip.members.some((member) => member.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: "You must be a trip member to view votes" });
    }

    const votes = await Vote.find({ tripId });
    const summaryMap = new Map();

    votes.forEach((vote) => {
      const key = vote.propertyId;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, { propertyId: key, up: 0, down: 0, userVote: null });
      }

      const row = summaryMap.get(key);
      if (vote.vote === "up") row.up += 1;
      if (vote.vote === "down") row.down += 1;
      if (vote.userId.toString() === req.userId) {
        row.userVote = vote.vote;
      }
    });

    res.json(Array.from(summaryMap.values()));
  })
);

export default router;
