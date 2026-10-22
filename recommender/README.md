# Learner Analytics (Python)

An offline analytics pass over learner attempt data. It complements the live
Node recommendation engine: where the API recommends lessons for one learner in
real time, this script looks across *all* learners to find patterns worth acting
on — cohorts with shared gaps, and the topics people struggle with most.

## What it does

1. Builds a learner × topic **mastery matrix** from attempt records.
2. Groups learners into **cohorts** with a small k-means implementation.
3. Reports each cohort's strongest topics and the topics it should focus on.
4. Ranks the **hardest topics overall** by accuracy.

The analysis uses only the Python standard library.

## Run it

```bash
cd recommender
python make_sample.py   # creates sample_data/attempts.json
python analyze.py
```

To analyse live data instead of the sample file, set `MONGODB_URI` (and
`pip install pymongo`); the script will read the `attempts` collection directly.

## Example output

```
Grouped 40 learners into 3 cohorts:

  Cohort 1: 12 learners | average mastery 74%
    strongest: joins (88%), sorting (87%), react-basics (87%)
    focus on:  classification (59%), apis (62%), arrays (62%)
  ...

Hardest topics overall (lowest accuracy):
  classification     60%  (78 answers)
  recursion          64%  (90 answers)
  apis               67%  (81 answers)
```
