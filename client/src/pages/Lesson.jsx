import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { api } from "../api/client.js";

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLesson(null);
    setResult(null);
    setAnswers({});
    setLoading(true);
    api(`/api/lessons/${id}`)
      .then((data) => active && setLesson(data.lesson))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  function selectOption(questionIndex, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  async function handleSubmit() {
    if (!lesson) return;
    const ordered = lesson.questions.map((q) => answers[q.index]);
    if (ordered.some((a) => a === undefined)) {
      setError("Please answer every question before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const data = await api(`/api/lessons/${id}/submit`, { method: "POST", body: { answers: ordered } });
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="center-screen">Loading lesson...</div>;
  if (error && !lesson) return <div className="alert">{error}</div>;
  if (!lesson) return null;

  const resultByIndex = result
    ? Object.fromEntries(result.questions.map((q) => [q.index, q]))
    : {};

  return (
    <div className="page page--narrow">
      <Link to={`/courses/${lesson.courseId}`} className="back-link">← {lesson.courseTitle}</Link>

      <header className="lesson-head">
        <span className="lesson-head__topic">{lesson.topic}</span>
        <h1>{lesson.title}</h1>
        {lesson.summary && <p className="muted">{lesson.summary}</p>}
      </header>

      {result && (
        <div className={`result-banner ${result.score >= 60 ? "result-banner--pass" : "result-banner--retry"}`}>
          <strong>You scored {result.score}%</strong> — {result.correctCount} of {result.total} correct.
          Your {lesson.topic} skill has been updated.
          <div className="result-banner__actions">
            <button className="btn btn--primary" onClick={() => navigate("/")}>See what's next</button>
            <Link className="btn btn--ghost" to={`/courses/${lesson.courseId}`}>Back to course</Link>
          </div>
        </div>
      )}

      <div className="quiz">
        {lesson.questions.map((question) => {
          const graded = resultByIndex[question.index];
          return (
            <div className="quiz__q" key={question.index}>
              <p className="quiz__prompt">
                {question.index + 1}. {question.prompt}
              </p>
              <div className="quiz__options">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[question.index] === optionIndex;
                  let state = "";
                  if (graded) {
                    if (optionIndex === graded.answerIndex) state = "correct";
                    else if (selected) state = "wrong";
                  } else if (selected) {
                    state = "selected";
                  }
                  return (
                    <button
                      type="button"
                      key={optionIndex}
                      className={`quiz__option quiz__option--${state || "idle"}`}
                      disabled={Boolean(result)}
                      onClick={() => selectOption(question.index, optionIndex)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && lesson && <div className="alert">{error}</div>}

      {!result && (
        <button className="btn btn--primary btn--block" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Checking..." : "Submit answers"}
        </button>
      )}
    </div>
  );
}
