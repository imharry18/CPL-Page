export default function RecordsSection({ highlights }) {
  const { leaders } = highlights;
  const records = [
    { label: "Most runs", ...leaders.runs, accent: "#ff5a6e" },
    { label: "Most wickets", ...leaders.wickets, accent: "#c8102e" },
    { label: "Most sixes", ...leaders.sixes, accent: "#e8394a" },
    { label: "Most fours", ...leaders.fours, accent: "#ede7da" },
  ];

  return (
    <section id="records" className="section">
      <div className="wrap">
        <div className="head reveal">
          <p className="eyebrow">All-time records</p>
          <h2 className="display display-l head-title">The names to beat.</h2>
          <div className="seam-rule head-rule" />
        </div>

        <div className="records-grid reveal">
          {records.map((record, i) => (
            <article
              className="record"
              key={record.label}
              style={{ "--rec-accent": record.accent, "--delay": `${i * 0.06}s` }}
            >
              <p className="record-label">{record.label}</p>
              {/* Number and unit are separate elements so the unit can be
                  smaller and the pair can be told never to wrap — that is what
                  keeps all four cards on one baseline. */}
              <p className="record-val">
                <strong>{record.value}</strong>
                <span>{record.unit}</span>
              </p>
              <span className="record-who">{record.player}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
