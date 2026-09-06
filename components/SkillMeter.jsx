/**
 * A self-rating as a meter rather than a word.
 *
 * "Okay / Okay / Okay" tells you nothing at a glance and reads as three
 * separate facts; four pips read as one, and two players can be compared down
 * a column without anyone parsing "Average" against "Good". The word is still
 * there for anyone who wants it — on hover, and for a screen reader.
 */
const LEVELS = { Best: 4, Good: 3, Average: 2, Okay: 1 };

export default function SkillMeter({ label, value, size = "sm" }) {
  const level = LEVELS[value] || 0;

  return (
    <div className={`meter meter-${size}`}>
      <span className="meter-label">{label}</span>
      <span
        className="meter-pips"
        title={value || "Not rated"}
        role="img"
        aria-label={`${label}: ${value || "not rated"}`}
      >
        {[1, 2, 3, 4].map((step) => (
          <i key={step} className={step <= level ? "on" : undefined} aria-hidden="true" />
        ))}
      </span>
    </div>
  );
}
