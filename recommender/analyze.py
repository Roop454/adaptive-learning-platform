"""Learner cohort analysis for the Adaptive Learning Platform.

Reads attempt records, builds a learner x topic mastery matrix, groups learners
into cohorts with a small k-means implementation, and reports where each cohort
is strong and weak. The output can be used to tune the recommendation weights or
to plan new content.

Data source:
  * If MONGODB_URI is set and pymongo is installed, attempts are read from the
    live `attempts` collection.
  * Otherwise it falls back to recommender/sample_data/attempts.json
    (run make_sample.py first to create it).

Only the Python standard library is required for the analysis itself.

Usage:
    python analyze.py
"""

import json
import os
import random
from collections import defaultdict
from pathlib import Path

SAMPLE_PATH = Path(__file__).parent / "sample_data" / "attempts.json"


def load_attempts():
    uri = os.environ.get("MONGODB_URI")
    if uri:
        try:
            from pymongo import MongoClient  # imported lazily so it stays optional

            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            db = client.get_default_database()
            rows = list(db.attempts.find({}, {"user": 1, "topic": 1, "difficulty": 1, "correct": 1}))
            return [
                {
                    "learner": str(r.get("user")),
                    "topic": r["topic"],
                    "difficulty": r.get("difficulty", 3),
                    "correct": bool(r.get("correct")),
                }
                for r in rows
            ]
        except Exception as exc:  # noqa: BLE001 - fall back to the sample file
            print(f"Could not read from MongoDB ({exc}); using sample data.")

    if not SAMPLE_PATH.exists():
        raise SystemExit("No sample data found. Run: python make_sample.py")

    return json.loads(SAMPLE_PATH.read_text())


def build_mastery_matrix(attempts):
    """Return (topics, matrix) where matrix[learner][topic] is accuracy 0..1."""
    totals = defaultdict(lambda: defaultdict(lambda: [0, 0]))  # learner -> topic -> [correct, total]
    topics = set()

    for row in attempts:
        topics.add(row["topic"])
        bucket = totals[row["learner"]][row["topic"]]
        bucket[1] += 1
        if row["correct"]:
            bucket[0] += 1

    topics = sorted(topics)
    matrix = {}
    for learner, topic_counts in totals.items():
        vector = []
        for topic in topics:
            correct, total = topic_counts.get(topic, [0, 0])
            # Unseen topics are treated as 0.5 (unknown), so they don't skew cohorts.
            vector.append(correct / total if total else 0.5)
        matrix[learner] = vector

    return topics, matrix


def kmeans(vectors, k, iterations=50, seed=2026):
    """A compact k-means. vectors is a list of equal-length lists."""
    rng = random.Random(seed)
    centroids = rng.sample(vectors, k)
    assignments = [0] * len(vectors)

    def distance(a, b):
        return sum((x - y) ** 2 for x, y in zip(a, b))

    for _ in range(iterations):
        changed = False
        for i, vector in enumerate(vectors):
            best = min(range(k), key=lambda c: distance(vector, centroids[c]))
            if best != assignments[i]:
                assignments[i] = best
                changed = True

        for c in range(k):
            members = [vectors[i] for i in range(len(vectors)) if assignments[i] == c]
            if members:
                centroids[c] = [sum(col) / len(members) for col in zip(*members)]

        if not changed:
            break

    return assignments, centroids


def topic_difficulty_report(attempts, topics):
    counts = {t: [0, 0] for t in topics}
    for row in attempts:
        counts[row["topic"]][1] += 1
        if row["correct"]:
            counts[row["topic"]][0] += 1

    report = []
    for topic in topics:
        correct, total = counts[topic]
        accuracy = correct / total if total else 0
        report.append((topic, accuracy, total))

    return sorted(report, key=lambda r: r[1])


def main() -> None:
    attempts = load_attempts()
    print(f"Loaded {len(attempts)} attempts.\n")

    topics, matrix = build_mastery_matrix(attempts)
    learners = list(matrix.keys())
    vectors = [matrix[l] for l in learners]

    k = min(3, len(vectors))
    assignments, centroids = kmeans(vectors, k)

    print(f"Grouped {len(learners)} learners into {k} cohorts:\n")
    for c in range(k):
        members = [learners[i] for i in range(len(learners)) if assignments[i] == c]
        if not members:
            continue

        centroid = centroids[c]
        ranked = sorted(zip(topics, centroid), key=lambda t: t[1])
        weak = ", ".join(f"{t} ({v:.0%})" for t, v in ranked[:3])
        strong = ", ".join(f"{t} ({v:.0%})" for t, v in ranked[-3:][::-1])
        avg = sum(centroid) / len(centroid)

        print(f"  Cohort {c + 1}: {len(members)} learners | average mastery {avg:.0%}")
        print(f"    strongest: {strong}")
        print(f"    focus on:  {weak}\n")

    print("Hardest topics overall (lowest accuracy):")
    for topic, accuracy, total in topic_difficulty_report(attempts, topics)[:5]:
        print(f"  {topic:<16} {accuracy:5.0%}  ({total} answers)")


if __name__ == "__main__":
    main()
