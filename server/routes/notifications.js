import express from "express";
import Notification from "../models/Notification.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
  res.json(notifications);
}));

router.patch("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  res.json(notif);
}));

router.post("/mark-all-read", authMiddleware, asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ userId: req.userId }, { isRead: true });
  res.json({ count: result.modifiedCount });
}));

export default router;
