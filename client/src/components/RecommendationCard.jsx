import { Link } from "react-router-dom";

const DIFFICULTY_LABELS = ["", "Intro", "Easy", "Core", "Hard", "Expert"];

export default function RecommendationCard({ rec }) {
  return (
    <Link to={`/lessons/${rec.lessonId}`} className="rec-card">
      <div className="rec-card__top">
        <span className="rec-card__topic">{rec.topic}</span>
        <span className={`tag tag--${rec.mastery}`}>{rec.mastery}</span>
      </div>
      <h3 className="rec-card__title">{rec.title}</h3>
      <p className="rec-card__reason">{rec.reason}</p>
      <div className="rec-card__meta">
        <span>{DIFFICULTY_LABELS[rec.difficulty] || "Core"}</span>
        {rec.estimatedMinutes ? <span>{rec.estimatedMinutes} min</span> : null}
        {rec.courseTitle ? <span>{rec.courseTitle}</span> : null}
      </div>
    </Link>
  );
}
