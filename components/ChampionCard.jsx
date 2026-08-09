"use client";

function StatPill({ label, value, accent }) {
  if (!value || value === "—" || value.startsWith("—")) return null;

  return (
    <div className="champion-stat-pill" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingLeft: '0.8rem', borderLeft: `2px solid ${accent}` }}>
      <span className="champion-stat-label" style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span className="champion-stat-value" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>{value}</span>
    </div>
  );
}

export default function ChampionCard({ champion, onRegister }) {
  const hasStats =
    champion.topScorer && champion.topScorer !== "—" && champion.topWickets && champion.topWickets !== "—";

  if (champion.isTeaser) {
    return (
      <article className="champion-banner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6rem 1rem', background: 'transparent', border: 'none', borderTop: '1px solid rgba(14, 165, 233, 0.2)', boxShadow: 'none' }}>
        <div className="champion-banner-glow" />
        <span className="champion-season-badge" style={{ marginBottom: '1.5rem', borderColor: 'rgba(14, 165, 233, 0.4)', color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.05)', padding: '0.6rem 1.2rem' }}>Season 4 · 2026</span>
        <h3 className="champion-banner-title" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          The Next Champion
          <br/>
          <span className="champion-banner-title-accent">Awaits.</span>
        </h3>
        <p className="champion-banner-text" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 3rem', color: 'rgba(255,255,255,0.6)' }}>
          Registrations opening soon. Assemble your squad and write the next chapter of CPL history.
        </p>
        <div className="champion-banner-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <button type="button" className="btn-premium" style={{ padding: '1.25rem 3.5rem', fontSize: '1rem', boxShadow: '0 0 40px rgba(14, 165, 233, 0.3)' }} onClick={onRegister}>
            Claim the Crown
          </button>
          <span className="champion-banner-hint" style={{ marginTop: '0.5rem' }}>Limited slots · Season 4</span>
        </div>
      </article>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .champion-card {
          position: relative; display: flex; flex-direction: column; gap: 1.25rem; padding: 2rem; min-height: 0;
          background: rgba(10,10,10,0.5);
          backdrop-filter: blur(20px) saturate(150%); border: 1px solid rgba(255,255,255,0.04);
          border-top: 2px solid var(--card-accent); border-radius: 24px;
          overflow: hidden; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02);
        }
        .champion-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 40px var(--card-glow);
        }
        .champion-card-glow {
          position: absolute; top: -30%; right: -30%; width: 300px; height: 300px;
          background: radial-gradient(circle, var(--card-glow) 0%, transparent 70%); pointer-events: none;
          opacity: 0.3; transition: opacity 0.5s;
        }
        .champion-card:hover .champion-card-glow { opacity: 0.8; }
        .champion-card-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
        .champion-crown {
          display: inline-flex; align-items: center; justify-content: center; width: 2.25rem; height: 2.25rem;
          border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
        }
        .champion-season-badge {
          display: inline-flex; align-items: center; padding: 0.4rem 0.9rem; border: 1px solid; border-radius: 100px;
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
        }
        .champion-info { display: flex; flex-direction: column; gap: 0.4rem; }
        .champion-year { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.2em; color: rgba(255,255,255,0.4); }
        .champion-name { font-size: clamp(1.8rem, 2.5vw, 2.2rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: #fff; margin-bottom: 0.2rem; }
        .champion-vs { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem; color: rgba(255,255,255,0.6); }
        .champion-vs-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--card-accent); }
        .champion-final { font-size: 0.85rem; line-height: 1.6; color: rgba(255,255,255,0.7); font-style: italic; margin: 0.5rem 0; }
        .champion-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .champion-stat-pill { /* Handled inline */ }
        .champion-stat-label { /* Handled inline */ }
        .champion-stat-value { /* Handled inline */ }
        .champion-footer { margin-top: auto; padding-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .champion-venue { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
        .champion-banner-title-accent { background: linear-gradient(135deg, #0ea5e9 0%, #fff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .champion-banner-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(14, 165, 233, 0.15) 0%, transparent 70%); pointer-events: none; }
      `}} />
      <article
        className="champion-card"
        style={{ "--card-accent": champion.color, "--card-glow": `${champion.color}33` }}
      >
        <div className="champion-card-glow" aria-hidden="true" />
        <div className="champion-card-header">
          <div
            className="champion-season-badge"
            style={{ borderColor: champion.color, color: champion.color, background: `${champion.color}14` }}
          >
            Season {champion.season}
          </div>
          <span className="champion-crown" style={{ color: champion.color }} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 18h18l-1.5-9-4.5 4.5L12 6 9 13.5 4.5 9 3 18z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M5 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        <div className="champion-info">
          <span className="champion-year">{champion.year}</span>
          <h3 className="champion-name">
            {champion.winner}
          </h3>
          {champion.captain && (
            <span className="champion-captain" style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, margin: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: champion.color }}>Captain</span>
              {champion.captain}
            </span>
          )}
          {champion.runnerUp && champion.runnerUp !== "—" ? (
            <span className="champion-vs">
              <span className="champion-vs-label">Runner-up</span>
              {champion.runnerUp}
            </span>
          ) : (
            <span className="champion-vs champion-vs-muted">Champion crowned</span>
          )}
        </div>

        {champion.final && (
          <p className="champion-final">{champion.final}</p>
        )}

        {hasStats ? (
          <div className="champion-stats-grid">
            <StatPill label="Top Runs" value={champion.topScorer} accent={champion.color} />
            <StatPill label="Top Wickets" value={champion.topWickets} accent={champion.color} />
          </div>
        ) : (
          <p className="champion-pending" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Detailed stats coming to the archive</p>
        )}

        <div className="champion-footer">
          <span className="champion-venue">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {champion.venue}
          </span>
        </div>
      </article>
    </>
  );
}
