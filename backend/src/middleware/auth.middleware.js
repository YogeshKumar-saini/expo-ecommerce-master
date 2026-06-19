import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
  // requireAuth(),
  async (req, res, next) => {
    try {
      // Fake Authentication for testing
      let user = await User.findOne({});
      if (!user) {
        user = await User.create({
          clerkId: "test_clerk_id",
          email: "test@example.com",
          name: "Test User"
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

export const adminOnly = (req, res, next) => {
  // Bypass admin checks for testing
  next();
};
