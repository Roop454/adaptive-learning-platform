// Runs the API against a throwaway in-memory MongoDB with seeded demo data.
// Handy for trying the app without installing MongoDB:  npm run dev:mem
//
// NOTE: all data lives in memory and is lost when the process stops.

import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-mem-secret";

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri();

const { connectDatabase } = await import("../src/config/db.js");
const { Course } = await import("../src/models/Course.js");
const { User } = await import("../src/models/User.js");
const { Attempt } = await import("../src/models/Attempt.js");
const { Progress } = await import("../src/models/Progress.js");
const { courses } = await import("../src/seed/data.js");
const { createApp } = await import("../src/index.js");

await connectDatabase(process.env.MONGODB_URI);
const savedCourses = await Course.insertMany(courses);

// Create a demo learner with a little history so the dashboard is populated.
const demo = new User({ name: "Demo Learner", email: "demo@learn.dev", goals: [] });
await demo.setPassword("demo1234");
await demo.save();

const lessons = savedCourses.flatMap((c) => c.lessons.map((l) => ({ course: c, lesson: l })));
let rngState = 7;
const rng = () => ((rngState = (rngState * 1664525 + 1013904223) >>> 0) / 0xffffffff);

for (const { course, lesson } of lessons.slice(0, 9)) {
  let correct = 0;
  const attempts = lesson.questions.map((q) => {
    const ok = rng() < 0.7;
    if (ok) correct += 1;
    return { user: demo._id, lesson: lesson._id, topic: lesson.topic, difficulty: lesson.difficulty, correct: ok };
  });
  await Attempt.insertMany(attempts);
  await Progress.create({
    user: demo._id,
    course: course._id,
    lesson: lesson._id,
    topic: lesson.topic,
    status: "completed",
    score: Math.round((correct / lesson.questions.length) * 100),
  });
}

const app = createApp();
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`In-memory API ready on http://localhost:${port}`);
  console.log("Login with demo@learn.dev / demo1234");
});

process.on("SIGINT", async () => {
  await mongo.stop();
  process.exit(0);
});
