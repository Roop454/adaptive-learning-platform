import { Router } from "express";

import { Progress } from "../models/Progress.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/progress
// Every lesson the learner has completed, newest first.
router.get("/", requireAuth, async (req, res) => {
  const rows = await Progress.find({ user: req.user._id })
    .populate("course", "title")
    .sort({ completedAt: -1 })
    .lean();

  const items = rows.map((row) => ({
    lessonId: row.lesson,
    topic: row.topic,
    status: row.status,
    score: row.score,
    courseTitle: row.course?.title ?? null,
    completedAt: row.completedAt,
  }));

  res.json({ completed: items.length, items });
});

export default router;
