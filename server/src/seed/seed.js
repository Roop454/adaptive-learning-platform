import "dotenv/config";
import mongoose from "mongoose";

import { connectDatabase } from "../config/db.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Attempt } from "../models/Attempt.js";
import { Progress } from "../models/Progress.js";
import { courses, demoLearners } from "./data.js";

// Simple seeded RNG so the generated activity is the same on every run.
function makeRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

// Pick a subset of lessons for a learner to have "worked through".
function pickLessons(allLessons, rng, min, max) {
  const count = Math.floor(rng() * (max - min + 1)) + min;
  const shuffled = [...allLessons].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

async function run() {
  await connectDatabase(process.env.MONGODB_URI);

  console.log("Clearing existing data...");
  await Promise.all([
    Course.deleteMany({}),
    User.deleteMany({}),
    Attempt.deleteMany({}),
    Progress.deleteMany({}),
  ]);

  console.log("Inserting courses...");
  const savedCourses = await Course.insertMany(courses);

  // Flatten lessons with a back-reference to their course.
  const allLessons = [];
  for (const course of savedCourses) {
    for (const lesson of course.lessons) {
      allLessons.push({ course, lesson });
    }
  }

  // Build the full learner list: the named demo accounts plus synthetic ones so
  // the analytics and recommendations have a realistic amount of history.
  const learners = [...demoLearners];
  for (let i = 1; i <= 20; i += 1) {
    learners.push({
      name: `Learner ${i}`,
      email: `learner${i}@learn.dev`,
      password: "demo1234",
      goals: [],
    });
  }

  const rng = makeRng(2026);
  let attemptCount = 0;
  let progressCount = 0;

  console.log(`Creating ${learners.length} learners with simulated activity...`);
  for (const [index, learnerInfo] of learners.entries()) {
    const user = new User({ name: learnerInfo.name, email: learnerInfo.email, goals: learnerInfo.goals });
    await user.setPassword(learnerInfo.password);
    await user.save();

    // Each learner has an underlying ability. Named demo learners get a bit
    // more history so their dashboards look lived-in.
    const ability = 0.35 + rng() * 0.5;
    const isDemo = index < demoLearners.length;
    const chosen = pickLessons(allLessons, rng, isDemo ? 10 : 4, isDemo ? 18 : 12);

    for (const { course, lesson } of chosen) {
      const attempts = [];
      let correctCount = 0;

      for (const question of lesson.questions) {
        // Probability of a correct answer falls as lesson difficulty rises
        // above the learner's ability.
        const difficultyGap = (lesson.difficulty - 1) / 4 - ability;
        const pCorrect = Math.max(0.1, Math.min(0.95, 0.75 - difficultyGap));
        const correct = rng() < pCorrect;
        if (correct) correctCount += 1;

        attempts.push({
          user: user._id,
          lesson: lesson._id,
          topic: lesson.topic,
          difficulty: lesson.difficulty,
          correct,
        });
      }

      await Attempt.insertMany(attempts);
      attemptCount += attempts.length;

      const score = Math.round((correctCount / lesson.questions.length) * 100);
      await Progress.create({
        user: user._id,
        course: course._id,
        lesson: lesson._id,
        topic: lesson.topic,
        status: "completed",
        score,
      });
      progressCount += 1;
    }
  }

  const totalRecords = attemptCount + progressCount;
  console.log("Seed complete.");
  console.log(`  Courses:   ${savedCourses.length}`);
  console.log(`  Learners:  ${learners.length}`);
  console.log(`  Attempts:  ${attemptCount}`);
  console.log(`  Progress:  ${progressCount}`);
  console.log(`  Total learning records: ${totalRecords}`);
  console.log("\nDemo login -> email: demo@learn.dev  password: demo1234");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
