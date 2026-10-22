"""Generate a sample attempts file for the analytics script.

In production you would export real attempts from MongoDB. This script creates
a realistic stand-in so `analyze.py` can run without a database.

Usage:
    python make_sample.py
"""

import json
import random
from pathlib import Path

TOPICS = [
    ("python-basics", 1),
    ("control-flow", 2),
    ("functions", 3),
    ("arrays", 2),
    ("recursion", 4),
    ("sorting", 3),
    ("sql-basics", 1),
    ("joins", 3),
    ("aggregation", 3),
    ("html-css", 1),
    ("react-basics", 2),
    ("react-state", 3),
    ("apis", 4),
    ("ml-basics", 2),
    ("regression", 4),
    ("classification", 4),
]

OUTPUT = Path(__file__).parent / "sample_data" / "attempts.json"


def main() -> None:
    random.seed(2026)
    rows = []

    for learner_id in range(1, 41):
        # Each learner has an overall ability plus a couple of strong topics.
        ability = random.uniform(0.35, 0.85)
        strengths = set(random.sample([t for t, _ in TOPICS], k=3))

        for topic, difficulty in TOPICS:
            if random.random() < 0.4:
                continue  # learner hasn't touched this topic

            boost = 0.2 if topic in strengths else 0.0
            for _ in range(random.randint(2, 5)):
                gap = (difficulty - 1) / 4 - (ability + boost)
                p_correct = max(0.1, min(0.95, 0.75 - gap))
                rows.append(
                    {
                        "learner": f"learner-{learner_id}",
                        "topic": topic,
                        "difficulty": difficulty,
                        "correct": random.random() < p_correct,
                    }
                )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(rows, indent=2))
    print(f"Wrote {len(rows)} sample attempts to {OUTPUT}")


if __name__ == "__main__":
    main()
