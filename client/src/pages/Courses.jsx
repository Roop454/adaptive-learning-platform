import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api("/api/courses")
      .then((data) => active && setCourses(data.courses))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="center-screen">Loading courses...</div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Course catalogue</h1>
          <p className="muted">Pick a track, or let your dashboard guide you.</p>
        </div>
      </header>

      <div className="course-grid">
        {courses.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className="course-card">
            <span className={`pill pill--${course.level}`}>{course.level}</span>
            <h3>{course.title}</h3>
            <p className="muted">{course.description}</p>
            <div className="course-card__meta">
              <span>{course.lessonCount} lessons</span>
              <span>{course.topics.length} topics</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
