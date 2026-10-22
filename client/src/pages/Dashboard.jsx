import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import RecommendationCard from "../components/RecommendationCard.jsx";
import SkillBar from "../components/SkillBar.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [profile, setProfile] = useState({ summary: {}, topics: [] });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [recData, profileData, analytics] = await Promise.all([
          api("/api/recommendations?limit=4"),
          api("/api/profile"),
          api("/api/analytics/summary"),
        ]);
        if (!active) return;
        setRecs(recData.recommendations);
        setProfile(profileData);
        setSummary(analytics);
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

  if (loading) return <div className="center-screen">Loading your dashboard...</div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1>Hi {user.name.split(" ")[0]} 👋</h1>
          <p className="muted">Here is what's worth learning next.</p>
        </div>
        <Link to="/courses" className="btn btn--primary">Browse courses</Link>
      </header>

      {summary && (
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
            <span className="stat-tile__num">{summary.questionsAnswered}</span>
            <span className="stat-tile__label">Questions answered</span>
          </div>
          <div className="stat-tile">
            <span className="stat-tile__num">{profile.summary.topicsStarted || 0}</span>
            <span className="stat-tile__label">Topics in progress</span>
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Recommended for you</h2>
        {recs.length === 0 ? (
          <p className="muted">You've completed everything available. Nice work!</p>
        ) : (
          <div className="rec-grid">
            {recs.map((rec) => (
              <RecommendationCard key={rec.lessonId} rec={rec} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Your skills</h2>
        {profile.topics.length === 0 ? (
          <p className="muted">Take a lesson to start building your skill profile.</p>
        ) : (
          <div className="skill-list">
            {profile.topics.slice(0, 8).map((t) => (
              <SkillBar key={t.topic} topic={t.topic} skill={t.skill} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
