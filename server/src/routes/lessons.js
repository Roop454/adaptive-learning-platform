import { Router } from "express";

import { Attempt } from "../models/Attempt.js";
import { Progress } from "../models/Progress.js";
import { findLesson } from "../services/learnerState.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/lessons/:lessonId
// Returns the lesson and its questions, but never the answer key so grading
// can only happen on the server.
router.get("/:lessonId", requireAuth, async (req, res) => {
  const found = await findLesson(req.params.lessonId);
  if (!found) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const { course, lesson } = found;
  res.json({
    lesson: {
      id: lesson._id,
      title: lesson.title,
      topic: lesson.topic,
      difficulty: lesson.difficulty,
      summary: lesson.summary,
      estimatedMinutes: lesson.estimatedMinutes,
      courseId: course._id,
      courseTitle: course.title,
      questions: (lesson.questions || []).map((q, index) => ({
        index,
        prompt: q.prompt,
        options: q.options,
      })),
    },
  });
});

// POST /api/lessons/:lessonId/submit
// Body: { answers: number[] } where answers[i] is the chosen option index for
// question i. The server grades, records one attempt per question (the signal
// the adaptive engine learns from), and marks the lesson complete.
router.post("/:lessonId/submit", requireAuth, async (req, res) => {
  const found = await findLesson(req.params.lessonId);
  if (!found) {
    return res.status(404).json({ error: "Lesson not found" });
  }

  const { course, lesson } = found;
  const questions = lesson.questions || [];
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

  if (answers.length !== questions.length) {
    return res.status(400).json({
      error: `Expected ${questions.length} answers, received ${answers.length}`,
    });
  }

  let correctCount = 0;
  const attempts = [];
  const perQuestion = [];

  questions.forEach((question, index) => {
    const isCorrect = Number(answers[index]) === question.answerIndex;
    if (isCorrect) correctCount += 1;

    perQuestion.push({ index, correct: isCorrect, answerIndex: question.answerIndex });
    attempts.push({
      user: req.user._id,
      lesson: lesson._id,
      topic: lesson.topic,
      difficulty: lesson.difficulty,
      correct: isCorrect,
    });
  });

  if (attempts.length > 0) {
    await Attempt.insertMany(attempts);
  }

  const score = questions.length === 0 ? 100 : Math.round((correctCount / questions.length) * 100);

  await Progress.findOneAndUpdate(
    { user: req.user._id, lesson: lesson._id },
    {
      user: req.user._id,
      course: course._id,
      lesson: lesson._id,
      topic: lesson.topic,
      status: "completed",
      score,
      completedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({
    lessonId: lesson._id,
    topic: lesson.topic,
    score,
    correctCount,
    total: questions.length,
    questions: perQuestion,
  });
});

export default router;
