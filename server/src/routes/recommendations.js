import { Router } from "express";

import { recommendLessons } from "../services/adaptiveEngine.js";
import { getAllLessons, loadSkillProfile, completedLessonIds } from "../services/learnerState.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/recommendations?limit=5
// The adaptive heart of the app: returns the lessons most worth doing next for
// the signed-in learner, with a short reason for each.
router.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);

  const [profile, lessons, completed] = await Promise.all([
    loadSkillProfile(req.user._id),
    getAllLessons(),
    completedLessonIds(req.user._id),
  ]);

  const recommendations = recommendLessons(lessons, completed, profile, limit);

  // Decorate with the course each lesson belongs to for nicer UI links.
  const lessonsById = new Map(lessons.map((l) => [String(l._id), l]));
  const enriched = recommendations.map((rec) => {
    const lesson = lessonsById.get(String(rec.lessonId));
    return {
      ...rec,
      courseId: lesson?.courseId ?? null,
      courseTitle: lesson?.courseTitle ?? null,
      estimatedMinutes: lesson?.estimatedMinutes ?? null,
    };
  });

  res.json({ recommendations: enriched });
});

export default router;
