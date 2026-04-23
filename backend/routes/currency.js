import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

const rates = { USD: 83, EUR: 92, GBP: 104, AUD: 55 };

router.post(
  "/convert",
  asyncHandler(async (req, res) => {
    const { amount, from, to } = req.body;
    if (from === to) return res.json({ result: amount, rate: 1 });

    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    const result = (amount / fromRate) * toRate;

    res.json({ result: Math.round(result * 100) / 100, rate: toRate / fromRate });
  })
);

router.get("/rates", asyncHandler(async (req, res) => {
  res.json({ INR: 1, ...rates });
}));

export default router;
