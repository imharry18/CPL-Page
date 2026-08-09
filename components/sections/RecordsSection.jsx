"use client";

export default function RecordsSection({ highlights, onRegister }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .section-records {
          min-height: 115vh; display: flex; align-items: center; justify-content: flex-end;
          padding: 8vh clamp(1rem, 5vw, 4rem); position: relative; box-sizing: border-box;
        }
        .records-shell {
          position: relative; width: 100%; padding: 2rem 0;
        }
        .records-shell > * { position: relative; z-index: 1; }
        .leader-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; margin-top: 2rem; }
        @media (max-width: 1024px) {
          .leader-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .leader-grid { grid-template-columns: 1fr; }
        }
        .leader-card {
          position: relative; overflow: hidden; padding: 1.5rem; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.5);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 12px 32px rgba(0,0,0,0.4);
          transition: transform 0.3s ease, border-color 0.3s;
        }
        .leader-card:hover { transform: translateY(-4px); border-color: rgba(14, 165, 233, 0.3); }
        .leader-card::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit; border-top: 2px solid var(--leader-accent); opacity: 0.8; pointer-events: none;
        }
        .leader-kicker { display: block; margin-bottom: 0.8rem; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); }
        .leader-value { display: block; font-size: clamp(1.5rem, 2vw, 2rem); line-height: 1; font-weight: 800; letter-spacing: -0.03em; color: #fff; }
        .leader-player { display: block; margin-top: 0.6rem; font-size: 0.85rem; line-height: 1.4; color: var(--text-secondary); }
      `}} />
      <section id="format" className="section-records">
        <div className="records-shell reveal" data-delay="0.1s">
          <span className="section-eyebrow" style={{ color: 'var(--accent-blue)' }}>League Records</span>
          <h2 className="section-title" style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            The Numbers
            <br />
            That Set the Standard.
          </h2>
          <p className="section-body" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6 }}>
            All-time CPL totals across every season, followed by the players who own the
            highest runs, wickets, sixes, and fours in league history.
          </p>
          <div className="leader-grid">
            <article className="leader-card" style={{ "--leader-accent": "#0ea5e9" }}>
              <span className="leader-kicker">Total Runs</span>
              <strong className="leader-value">{highlights.totals.runs}</strong>
              <span className="leader-player">CPL total</span>
            </article>
            <article className="leader-card" style={{ "--leader-accent": "#e5e7eb" }}>
              <span className="leader-kicker">Total Wickets</span>
              <strong className="leader-value">{highlights.totals.wickets}</strong>
              <span className="leader-player">CPL total</span>
            </article>
            <article className="leader-card" style={{ "--leader-accent": "#9ca3af" }}>
              <span className="leader-kicker">Total Sixes</span>
              <strong className="leader-value">{highlights.totals.sixes}</strong>
              <span className="leader-player">CPL total</span>
            </article>
            <article className="leader-card" style={{ "--leader-accent": "#0ea5e9" }}>
              <span className="leader-kicker">Total Fours</span>
              <strong className="leader-value">{highlights.totals.fours}</strong>
              <span className="leader-player">CPL total</span>
            </article>
            <article className="leader-card" style={{ "--leader-accent": "#0ea5e9" }}>
              <span className="leader-kicker">Highest Scorer</span>
              <strong className="leader-value">{highlights.leaders.runs.value}</strong>
              <span className="leader-player">{highlights.leaders.runs.player}</span>
            </article>
            <article className="leader-card" style={{ "--leader-accent": "#e5e7eb" }}>
              <span className="leader-kicker">Highest Wickets</span>
              <strong className="leader-value">{highlights.leaders.wickets.value}</strong>
              <span className="leader-player">{highlights.leaders.wickets.player}</span>
            </article>
            <article className="leader-card" style={{ "--leader-accent": "#9ca3af" }}>
              <span className="leader-kicker">Highest Sixes</span>
              <strong className="leader-value">{highlights.leaders.sixes.value}</strong>
              <span className="leader-player">{highlights.leaders.sixes.player}</span>
            </article>
            <article className="leader-card" style={{ "--leader-accent": "#0ea5e9" }}>
              <span className="leader-kicker">Highest Fours</span>
              <strong className="leader-value">{highlights.leaders.fours.value}</strong>
              <span className="leader-player">{highlights.leaders.fours.player}</span>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
