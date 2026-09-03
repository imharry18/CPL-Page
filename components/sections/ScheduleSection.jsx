import Link from "next/link";

export default function ScheduleSection({ dates }) {
  return (
    <section id="schedule" className="section schedule">
      <div className="wrap">
        <div className="head reveal">
          <p className="eyebrow">September 2026</p>
          <h2 className="display display-l head-title">A season in three days.</h2>
          <div className="seam-rule head-rule" />
        </div>

        <ol className="dates">
          {dates.map((entry, i) => (
            <li
              className="date reveal"
              key={entry.label}
              style={{ "--delay": `${i * 0.08}s` }}
            >
              <p className="date-num">
                <strong>{entry.day}</strong>
                <span>{entry.month}</span>
              </p>
              <div>
                <h3 className="date-label">{entry.label}</h3>
                <p className="date-note">{entry.note}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="schedule-cta reveal">
          <Link className="btn btn-primary btn-lg" href="/lobby">
            Season 4
          </Link>
          <span>Every match at the football ground. Entries are closed.</span>
        </p>
      </div>
    </section>
  );
}
