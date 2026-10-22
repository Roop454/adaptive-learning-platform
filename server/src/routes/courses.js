import { Router } from "express";

import { Course } from "../models/Course.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/courses  -> catalogue without quiz answers
router.get("/", requireAuth, async (req, res) => {
  const courses = await Course.find().lean();

  const catalogue = courses.map((course) => ({
    id: course._id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    level: course.level,
    lessonCount: (course.lessons || []).length,
    topics: [...new Set((course.lessons || []).map((l) => l.topic))],
  }));

  res.json({ courses: catalogue });
});

// GET /api/courses/:id  -> course with its lessons (answers stripped)
router.get("/:id", requireAuth, async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const lessons = (course.lessons || []).map((lesson) => ({
    id: lesson._id,
    title: lesson.title,
    topic: lesson.topic,
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimatedMinutes,
    summary: lesson.summary,
    prerequisites: lesson.prerequisites,
    questionCount: (lesson.questions || []).length,
  }));

  res.json({
    course: {
      id: course._id,
      title: course.title,
      description: course.description,
      level: course.level,
      lessons,
    },
  });
});

export default router;
