import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { api } from "../api/client.js";

const DIFFICULTY_LABELS = ["", "Intro", "Easy", "Core", "Hard", "Expert"];

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api(`/api/courses/${id}`)
      .then((data) => active && setCourse(data.course))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="center-screen">Loading course...</div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="page">
      <Link to="/courses" className="back-link">← All courses</Link>
      <header className="page__head">
        <div>
          <h1>{course.title}</h1>
          <p className="muted">{course.description}</p>
        </div>
      </header>

      <ol className="lesson-list">
        {course.lessons.map((lesson, index) => (
          <li key={lesson.id}>
            <Link to={`/lessons/${lesson.id}`} className="lesson-row">
              <span className="lesson-row__index">{index + 1}</span>
              <span className="lesson-row__body">
                <span className="lesson-row__title">{lesson.title}</span>
                <span className="lesson-row__topic">{lesson.topic}</span>
              </span>
              <span className="lesson-row__meta">
                <span className="pill pill--plain">{DIFFICULTY_LABELS[lesson.difficulty]}</span>
                <span>{lesson.estimatedMinutes} min</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
