import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { generateToken } from "../utils/helpers.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import config from "../config/env.js";

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
  authLimiter,
  [
    body("email")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name")
      .isString()
      .withMessage("Name must be a string")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),
    body("role")
      .optional()
      .isIn(["guest", "host", "both"])
      .withMessage("Invalid role"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const email = String(req.body.email).toLowerCase().trim();
    const name = String(req.body.name).trim();
    const password = String(req.body.password);
    const role = req.body.role || "guest";

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token, user: buildUserPayload(user) });
  })
);

router.post(
  "/login",
  authLimiter,
  [
    body("email")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isString()
      .withMessage("Password must be a string")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const email = String(req.body.email).toLowerCase().trim();
    const password = String(req.body.password);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.json({ token, user: buildUserPayload(user) });
  })
);

router.get(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  })
);

router.put(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { name, avatar, phone, bio, currencyPreference, role } = req.body;
    const updates = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof avatar === "string") updates.avatar = avatar;
    if (typeof phone === "string") updates.phone = phone;
    if (typeof bio === "string") updates.bio = bio;
    if (typeof currencyPreference === "string") updates.currencyPreference = currencyPreference;
    if (role && ["guest", "host", "both"].includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  })
);

router.post(
  "/change-password",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  })
);

router.post(
  "/request-password-reset",
  authLimiter,
  [
    body("email")
      .isString()
      .withMessage("Email must be a string")
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const email = String(req.body.email).toLowerCase().trim();
    const user = await User.findOne({ email });

    // Always return generic 200 to prevent email enumeration
    if (!user) {
      return res.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id, type: "password_reset" },
      config.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1h" }
    );

    // Non-blocking email dispatch
    sendPasswordResetEmail(user.email, resetToken).catch((err) =>
      console.error("[EMAIL] Password reset send failed:", err.message)
    );

    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  })
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("token").isString().notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isString()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const token = String(req.body.token);
    const newPassword = String(req.body.newPassword);

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    if (!decoded || decoded.type !== "password_reset" || !decoded.id) {
      return res.status(400).json({ message: "Invalid token type" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password has been reset successfully" });
  })
);

export default router;
