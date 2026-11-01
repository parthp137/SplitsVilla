import express from "express";

import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get(
  "/search",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (rawQ.length < 2) {
      return res.json([]);
    }

    const safeQ = rawQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query = {
      _id: { $ne: req.userId },
      $or: [{ name: { $regex: safeQ, $options: "i" } }, { email: { $regex: safeQ, $options: "i" } }],
    };

    const users = await User.find(query)
      .select("name email avatar")
      .sort({ name: 1 })
      .limit(8);

    res.json(
      users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }))
    );
  })
);

export default router;
