// Adaptive engine
//
// This module holds the logic that makes the platform "adaptive": it keeps a
// running estimate of how well a learner knows each topic, and uses those
// estimates to pick the lessons that are most useful to show next.
//
// Everything here is written as plain functions with no database or network
// access so the behaviour is easy to reason about and to unit test.

const MIN_SKILL = 0;
const MAX_SKILL = 1;

// How strongly a single quiz result moves the skill estimate. Harder questions
// move the needle more, because getting a hard question right (or wrong) tells
// us more than an easy one.
const BASE_LEARNING_RATE = 0.18;

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

// Lesson difficulty is stored on a 1..5 scale. Normalise it to 0..1 so it can
// be compared directly against a skill estimate.
function normaliseDifficulty(difficulty) {
  return clamp((difficulty - 1) / 4, 0, 1);
}

// Update a single topic skill after one answered question.
//
// We treat it a little like an Elo / IRT update: the surprise of the outcome
// drives the size of the change. Answering a question that was well above the
// learner's current level earns more credit; missing an easy one costs more.
export function updateSkill(currentSkill, difficulty, wasCorrect) {
  const skill = clamp(currentSkill, MIN_SKILL, MAX_SKILL);
  const level = normaliseDifficulty(difficulty);

  // Probability the learner answers correctly given current skill vs. level.
  const expected = 1 / (1 + Math.exp(-(skill - level) * 6));
  const actual = wasCorrect ? 1 : 0;

  // Weight harder questions a bit more.
  const difficultyWeight = 0.6 + 0.4 * level;
  const delta = BASE_LEARNING_RATE * difficultyWeight * (actual - expected);

  return clamp(skill + delta, MIN_SKILL, MAX_SKILL);
}

// Build a fresh learner profile from a list of recorded quiz attempts.
//
// `attempts` is an array of { topic, difficulty, correct } in the order they
// happened. Returns a map of topic -> { skill, attempts, correct }.
export function buildSkillProfile(attempts = []) {
  const profile = {};

  for (const attempt of attempts) {
    const { topic, difficulty, correct } = attempt;
    if (!topic) continue;

    if (!profile[topic]) {
      profile[topic] = { skill: 0.3, attempts: 0, correct: 0 };
    }

    const entry = profile[topic];
    entry.skill = updateSkill(entry.skill, difficulty ?? 3, Boolean(correct));
    entry.attempts += 1;
    entry.correct += correct ? 1 : 0;
  }

  return profile;
}

// Decide which difficulty band to aim for next on a given topic.
//
// The idea is the "zone of proximal development": keep the learner slightly
// stretched. Someone who has mastered a topic should be nudged toward harder
// material; a beginner should stay near the easy end.
export function targetDifficulty(skill) {
  const stretched = clamp(skill, 0, 1) + 0.15;
  return clamp(Math.round(stretched * 4) + 1, 1, 5);
}

function masteryLabel(skill) {
  if (skill >= 0.8) return "strong";
  if (skill >= 0.55) return "steady";
  if (skill >= 0.3) return "developing";
  return "new";
}

// Score a single candidate lesson for a learner. Higher is more relevant.
//
// The score blends three things:
//   relevance   - topics the learner is weakest in matter most
//   fit         - lessons close to the learner's target difficulty
//   readiness   - prerequisites the learner has not reached yet are penalised
function scoreLesson(lesson, profile) {
  const topicEntry = profile[lesson.topic] || { skill: 0.3, attempts: 0 };
  const skill = topicEntry.skill;

  // Weaker topics get a higher relevance score so gaps are closed first.
  const relevance = 1 - skill;

  // How close is this lesson to the difficulty we want this learner on?
  const want = normaliseDifficulty(targetDifficulty(skill));
  const have = normaliseDifficulty(lesson.difficulty);
  const fit = 1 - Math.abs(want - have);

  // Prerequisite readiness: average skill across the lesson's prerequisites.
  let readiness = 1;
  if (Array.isArray(lesson.prerequisites) && lesson.prerequisites.length > 0) {
    const scores = lesson.prerequisites.map((t) => (profile[t]?.skill ?? 0));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    // If the learner is not ready for the prerequisites, push this lesson down.
    readiness = clamp(avg + 0.2, 0, 1);
  }

  const score = relevance * 0.5 + fit * 0.3 + readiness * 0.2;

  return {
    score,
    reason: explainScore({ skill, relevance, fit, readiness, lesson }),
    mastery: masteryLabel(skill),
  };
}

function explainScore({ skill, fit, readiness, lesson }) {
  if (readiness < 0.4) {
    return `Builds on ${lesson.topic} fundamentals you are still reaching.`;
  }
  if (skill < 0.3) {
    return `Fills a gap in ${lesson.topic}, where you are just getting started.`;
  }
  if (skill >= 0.75 && fit > 0.6) {
    return `Stretches your strong ${lesson.topic} skills with tougher material.`;
  }
  return `Keeps you progressing in ${lesson.topic} at the right level.`;
}

// Recommend the next lessons for a learner.
//
//   lessons        - all lessons available
//   completedIds   - ids of lessons the learner has already finished
//   profile        - output of buildSkillProfile()
//   limit          - how many recommendations to return
export function recommendLessons(lessons, completedIds, profile, limit = 5) {
  const done = new Set((completedIds || []).map(String));

  const ranked = lessons
    .filter((lesson) => !done.has(String(lesson._id ?? lesson.id)))
    .map((lesson) => {
      const { score, reason, mastery } = scoreLesson(lesson, profile);
      return {
        lessonId: lesson._id ?? lesson.id,
        title: lesson.title,
        topic: lesson.topic,
        difficulty: lesson.difficulty,
        score: Number(score.toFixed(4)),
        reason,
        mastery,
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
}

// A compact summary used by the dashboard and analytics endpoints.
export function summariseProfile(profile) {
  const topics = Object.entries(profile);
  if (topics.length === 0) {
    return { topicsStarted: 0, averageSkill: 0, strongest: null, weakest: null };
  }

  let strongest = null;
  let weakest = null;
  let total = 0;

  for (const [topic, entry] of topics) {
    total += entry.skill;
    if (!strongest || entry.skill > strongest.skill) strongest = { topic, skill: entry.skill };
    if (!weakest || entry.skill < weakest.skill) weakest = { topic, skill: entry.skill };
  }

  return {
    topicsStarted: topics.length,
    averageSkill: Number((total / topics.length).toFixed(3)),
    strongest,
    weakest,
  };
}
