import express from "express";
import { body } from "express-validator";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { generateToken } from "../utils/helpers.js";

const router = express.Router();

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  phone: user.phone,
  bio: user.bio,
  currencyPreference: user.currencyPreference,
  role: user.role,
  isVerified: user.isVerified,
  wishlist: user.wishlist || [],
  createdAt: user.createdAt,
});

router.post(
  "/register",
  [body("email").isEmail(), body("password").isLength({ min: 6 }), body("name").notEmpty()],
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token, user: buildUserPayload(user) });
  })
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({ token, user: buildUserPayload(user) });
  })
);

router.get("/profile", authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
}));

router.put("/profile", authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true }).select("-password");
  res.json(user);
}));

router.post("/change-password", authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password changed successfully" });
}));

export default router;
