import { Router } from "express";

import { summariseProfile } from "../services/adaptiveEngine.js";
import { loadSkillProfile } from "../services/learnerState.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/profile
// The learner's skill estimate per topic plus a short summary. This is the
// "real-time user profiling" surface the dashboard reads from.
router.get("/", requireAuth, async (req, res) => {
  const profile = await loadSkillProfile(req.user._id);

  const topics = Object.entries(profile)
    .map(([topic, entry]) => ({
      topic,
      skill: Number(entry.skill.toFixed(3)),
      attempts: entry.attempts,
      correct: entry.correct,
      accuracy: entry.attempts ? Number((entry.correct / entry.attempts).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.skill - a.skill);

  res.json({
    summary: summariseProfile(profile),
    topics,
  });
});

export default router;
