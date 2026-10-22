// A labelled progress bar for a single topic's skill estimate (0..1).
export default function SkillBar({ topic, skill }) {
  const percent = Math.round(skill * 100);

  let level = "new";
  if (skill >= 0.8) level = "strong";
  else if (skill >= 0.55) level = "steady";
  else if (skill >= 0.3) level = "developing";

  return (
    <div className="skillbar">
      <div className="skillbar__head">
        <span className="skillbar__topic">{topic}</span>
        <span className={`skillbar__level skillbar__level--${level}`}>{percent}%</span>
      </div>
      <div className="skillbar__track">
        <div className={`skillbar__fill skillbar__fill--${level}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
