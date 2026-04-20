import express from "express";
import Vote from "../models/Vote.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post(
  "/:tripId/votes",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { propertyId, voteType } = req.body;
    const { tripId } = req.params;

    let vote = await Vote.findOne({ tripId, propertyId, userId: req.userId });
    if (vote) {
      vote.vote = voteType;
      await vote.save();
    } else {
      vote = new Vote({ tripId, propertyId, userId: req.userId, vote: voteType });
      await vote.save();
    }

    res.json(vote);
  })
);

export default router;
