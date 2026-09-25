/**
 * A self-rating as a meter rather than a number.
 *
 * The entry form asks for one to five. A bare "4" reads as a fact to be
 * parsed; five pips read as a level, and two players can be compared down a
 * column at a glance. The number is still there for anyone who wants it — on
 * hover, and for a screen reader.
 */
export default function SkillMeter({ label, value, size = "sm" }) {
  const level = Number(value) || 0;

  return (
    <div className={`meter meter-${size}`}>
      <span className="meter-label">{label}</span>
      <span
        className="meter-pips"
        title={level ? `${level} of 5` : "Not rated"}
        role="img"
        aria-label={`${label}: ${level ? `${level} of 5` : "not rated"}`}
      >
        {[1, 2, 3, 4, 5].map((step) => (
          <i key={step} className={step <= level ? "on" : undefined} aria-hidden="true" />
        ))}
      </span>
    </div>
  );
}
