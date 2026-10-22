import { useEffect, useState } from "react";

import { api } from "../api/client.js";
import SkillBar from "../components/SkillBar.jsx";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState({ topics: [], summary: {} });
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [analytics, profileData, progressData] = await Promise.all([
          api("/api/analytics/summary"),
          api("/api/profile"),
          api("/api/progress"),
        ]);
        if (!active) return;
        setSummary(analytics);
        setProfile(profileData);
        setProgress(progressData.items);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="center-screen">Loading analytics...</div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Your analytics</h1>
          <p className="muted">A closer look at your progress and mastery.</p>
        </div>
      </header>

      <section className="stat-row">
        <div className="stat-tile">
          <span className="stat-tile__num">{summary.lessonsCompleted}</span>
          <span className="stat-tile__label">Lessons completed</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__num">{summary.averageScore}%</span>
          <span className="stat-tile__label">Average score</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__num">{Math.round(summary.overallAccuracy * 100)}%</span>
          <span className="stat-tile__label">Overall accuracy</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__num">{summary.questionsAnswered}</span>
          <span className="stat-tile__label">Questions answered</span>
        </div>
      </section>

      <div className="analytics-cols">
        <section>
          <h2 className="section-title">Mastery by topic</h2>
          {profile.topics.length === 0 ? (
            <p className="muted">No topics yet — complete a lesson to begin.</p>
          ) : (
            <div className="skill-list">
              {profile.topics.map((t) => (
                <SkillBar key={t.topic} topic={t.topic} skill={t.skill} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="section-title">Recent activity</h2>
          {progress.length === 0 ? (
            <p className="muted">Nothing completed yet.</p>
          ) : (
            <ul className="activity">
              {progress.slice(0, 10).map((item) => (
                <li key={`${item.lessonId}`} className="activity__row">
                  <span className="activity__topic">{item.topic}</span>
                  <span className="activity__course">{item.courseTitle}</span>
                  <span className={`activity__score ${item.score >= 60 ? "ok" : "low"}`}>{item.score}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
