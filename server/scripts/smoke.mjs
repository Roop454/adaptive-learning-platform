// End-to-end smoke test.
//
// Boots an in-memory MongoDB, starts the real Express app, and drives the main
// user journey over HTTP: register -> browse -> take a lesson -> see adaptive
// recommendations and analytics. Run it with: npm run smoke
//
// This is a manual check (not part of `npm test`) because it needs to download
// a MongoDB binary the first time it runs.

import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = "smoke-secret";

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri();

const { connectDatabase } = await import("../src/config/db.js");
const { Course } = await import("../src/models/Course.js");
const { createApp } = await import("../src/index.js");
const { courses } = await import("../src/seed/data.js");

await connectDatabase(process.env.MONGODB_URI);
await Course.insertMany(courses);

const app = createApp();
const server = app.listen(0);
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

let passed = 0;
function check(label, condition) {
  assert.ok(condition, label);
  console.log(`  ok  ${label}`);
  passed += 1;
}

try {
  const health = await api("/api/health");
  check("health endpoint returns ok", health.json.status === "ok");

  const register = await api("/api/auth/register", {
    method: "POST",
    body: { name: "Smoke Tester", email: "smoke@test.dev", password: "test1234" },
  });
  check("register returns a token", register.status === 201 && Boolean(register.json.token));
  const token = register.json.token;

  const me = await api("/api/auth/me", { token });
  check("me returns the signed-in user", me.json.user.email === "smoke@test.dev");

  const courseList = await api("/api/courses", { token });
  check("courses are listed", courseList.json.courses.length === courses.length);

  const firstCourseId = courseList.json.courses[0].id;
  const courseDetail = await api(`/api/courses/${firstCourseId}`, { token });
  check("course detail returns lessons", courseDetail.json.course.lessons.length > 0);

  const firstLessonId = courseDetail.json.course.lessons[0].id;
  const lesson = await api(`/api/lessons/${firstLessonId}`, { token });
  check("lesson returns questions without answers", lesson.json.lesson.questions.every((q) => !("answerIndex" in q)));

  // Answer every question correctly by reading the catalogue answer key.
  const answerKey = courses
    .flatMap((c) => c.lessons)
    .find((l) => l.title === lesson.json.lesson.title);
  const answers = lesson.json.lesson.questions.map((_, i) => answerKey.questions[i].answerIndex);

  const submit = await api(`/api/lessons/${firstLessonId}/submit`, {
    method: "POST",
    token,
    body: { answers },
  });
  check("submitting correct answers scores 100", submit.json.score === 100);

  const profile = await api("/api/profile", { token });
  check("profile now tracks the lesson topic", profile.json.topics.length >= 1);

  const recs = await api("/api/recommendations?limit=3", { token });
  check("recommendations are returned", recs.json.recommendations.length >= 1);
  check("completed lesson is not recommended", recs.json.recommendations.every((r) => String(r.lessonId) !== String(firstLessonId)));

  const progress = await api("/api/progress", { token });
  check("progress shows one completed lesson", progress.json.completed === 1);

  const analytics = await api("/api/analytics/summary", { token });
  check("analytics reports one completed lesson", analytics.json.lessonsCompleted === 1);

  console.log(`\nAll ${passed} smoke checks passed.`);
} catch (err) {
  console.error("\nSmoke test failed:", err.message);
  process.exitCode = 1;
} finally {
  server.close();
  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
  await mongo.stop();
}
