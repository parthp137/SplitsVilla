import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post(
  "/estimate",
  asyncHandler(async (req, res) => {
    const { destination, nights, groupSize, budgetPerPerson } = req.body;
    const estimate = budgetPerPerson * nights * groupSize;

    res.json({
      estimate,
      breakdown: {
        accommodation: estimate * 0.4,
        food: estimate * 0.35,
        activities: estimate * 0.15,
        transport: estimate * 0.1,
      },
      tips: [
        `Book accommodation in advance for ${destination}`,
        "Consider group discounts for activities",
        "Set daily budget limits to avoid overspending",
      ],
    });
  })
);

export default router;
