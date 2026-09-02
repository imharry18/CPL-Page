export default function ScheduleSection({ dates, registerUrl }) {
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
          <a
            className="btn btn-primary btn-lg"
            href={registerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enter Season 4
          </a>
          <span>Every match at the football ground. Entries close 11 September.</span>
        </p>
      </div>
    </section>
  );
}
