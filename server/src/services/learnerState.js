import { Course } from "../models/Course.js";
import { Attempt } from "../models/Attempt.js";
import { Progress } from "../models/Progress.js";
import { buildSkillProfile } from "./adaptiveEngine.js";

// Flattens every lesson across all courses into a single array the adaptive
// engine can rank. Each entry keeps a reference back to its course.
export async function getAllLessons() {
  const courses = await Course.find().lean();
  const lessons = [];

  for (const course of courses) {
    for (const lesson of course.lessons || []) {
      lessons.push({
        _id: lesson._id,
        title: lesson.title,
        topic: lesson.topic,
        difficulty: lesson.difficulty,
        estimatedMinutes: lesson.estimatedMinutes,
        prerequisites: lesson.prerequisites || [],
        courseId: course._id,
        courseTitle: course.title,
      });
    }
  }

  return lessons;
}

// Finds a single lesson (and its parent course) by the lesson's subdocument id.
export async function findLesson(lessonId) {
  const course = await Course.findOne({ "lessons._id": lessonId }).lean();
  if (!course) return null;

  const lesson = (course.lessons || []).find((l) => String(l._id) === String(lessonId));
  if (!lesson) return null;

  return { course, lesson };
}

// Replays a learner's attempts to produce their current skill profile.
export async function loadSkillProfile(userId) {
  const attempts = await Attempt.find({ user: userId }).sort({ createdAt: 1 }).lean();
  return buildSkillProfile(attempts);
}

export async function completedLessonIds(userId) {
  const rows = await Progress.find({ user: userId, status: "completed" }).select("lesson").lean();
  return rows.map((row) => String(row.lesson));
}
