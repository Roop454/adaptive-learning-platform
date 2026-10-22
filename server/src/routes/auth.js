import { Router } from "express";

import { User } from "../models/User.js";
import { signToken } from "../utils/token.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, goals } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const user = new User({ name, email, goals: Array.isArray(goals) ? goals : [] });
  await user.setPassword(password);
  await user.save();

  const token = signToken(user._id, req.app.locals.jwtSecret);
  return res.status(201).json({ token, user: user.toSafeJSON() });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.checkPassword(password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user._id, req.app.locals.jwtSecret);
  return res.json({ token, user: user.toSafeJSON() });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

export default router;
