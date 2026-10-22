import { test } from "node:test";
import assert from "node:assert/strict";

import {
  updateSkill,
  buildSkillProfile,
  targetDifficulty,
  recommendLessons,
  summariseProfile,
} from "../src/services/adaptiveEngine.js";

test("a correct answer raises the skill estimate", () => {
  const before = 0.4;
  const after = updateSkill(before, 3, true);
  assert.ok(after > before, "skill should increase after a correct answer");
});

test("a wrong answer lowers the skill estimate", () => {
  const before = 0.6;
  const after = updateSkill(before, 3, false);
  assert.ok(after < before, "skill should decrease after a wrong answer");
});

test("skill stays within 0..1 bounds", () => {
  let skill = 0.95;
  for (let i = 0; i < 20; i += 1) skill = updateSkill(skill, 5, true);
  assert.ok(skill <= 1, "skill must not exceed 1");

  let low = 0.05;
  for (let i = 0; i < 20; i += 1) low = updateSkill(low, 1, false);
  assert.ok(low >= 0, "skill must not drop below 0");
});

test("building a profile tracks attempts and correct counts", () => {
  const attempts = [
    { topic: "arrays", difficulty: 2, correct: true },
    { topic: "arrays", difficulty: 3, correct: true },
    { topic: "arrays", difficulty: 4, correct: false },
    { topic: "sql", difficulty: 2, correct: true },
  ];
  const profile = buildSkillProfile(attempts);

  assert.equal(profile.arrays.attempts, 3);
  assert.equal(profile.arrays.correct, 2);
  assert.equal(profile.sql.attempts, 1);
  assert.ok(profile.arrays.skill > 0 && profile.arrays.skill < 1);
});

test("target difficulty rises with skill", () => {
  assert.ok(targetDifficulty(0.9) >= targetDifficulty(0.2));
  assert.ok(targetDifficulty(0.1) >= 1 && targetDifficulty(1) <= 5);
});

test("recommendations prioritise weaker topics and skip completed lessons", () => {
  const lessons = [
    { _id: "l1", title: "Arrays intro", topic: "arrays", difficulty: 2, prerequisites: [] },
    { _id: "l2", title: "SQL joins", topic: "sql", difficulty: 3, prerequisites: [] },
    { _id: "l3", title: "Arrays advanced", topic: "arrays", difficulty: 4, prerequisites: [] },
  ];

  // Learner is strong at arrays, weak at sql.
  const profile = {
    arrays: { skill: 0.9, attempts: 5, correct: 5 },
    sql: { skill: 0.1, attempts: 2, correct: 0 },
  };

  const recs = recommendLessons(lessons, ["l1"], profile, 3);

  assert.equal(recs.length, 2, "completed lesson l1 should be excluded");
  assert.equal(recs[0].topic, "sql", "weakest topic should rank first");
  assert.ok(recs[0].reason.length > 0);
});

test("profile summary reports strongest and weakest topics", () => {
  const profile = {
    arrays: { skill: 0.8, attempts: 4, correct: 4 },
    sql: { skill: 0.2, attempts: 3, correct: 1 },
  };
  const summary = summariseProfile(profile);

  assert.equal(summary.topicsStarted, 2);
  assert.equal(summary.strongest.topic, "arrays");
  assert.equal(summary.weakest.topic, "sql");
});
