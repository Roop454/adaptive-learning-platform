import { Router } from "express";

import { Progress } from "../models/Progress.js";
import { Attempt } from "../models/Attempt.js";
import { summariseProfile } from "../services/adaptiveEngine.js";
import { loadSkillProfile } from "../services/learnerState.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/analytics/summary
// Headline numbers for the dashboard: lessons done, average score, questions
// answered, and the learner's mastery spread across topics.
router.get("/summary", requireAuth, async (req, res) => {
  const [progress, attempts, profile] = await Promise.all([
    Progress.find({ user: req.user._id }).lean(),
    Attempt.find({ user: req.user._id }).lean(),
    loadSkillProfile(req.user._id),
  ]);

  const lessonsCompleted = progress.length;
  const averageScore =
    lessonsCompleted === 0
      ? 0
      : Math.round(progress.reduce((sum, row) => sum + (row.score || 0), 0) / lessonsCompleted);

  const totalAnswered = attempts.length;
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const overallAccuracy = totalAnswered ? Number((totalCorrect / totalAnswered).toFixed(2)) : 0;

  res.json({
    lessonsCompleted,
    averageScore,
    questionsAnswered: totalAnswered,
    overallAccuracy,
    profile: summariseProfile(profile),
  });
});

export default router;
