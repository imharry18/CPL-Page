"use client";

import ChampionCard from "@/components/ChampionCard";

export default function ChampionsSection({ champions, onRegister }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .section-champions-wrapper {
          position: relative; min-height: 120vh; display: flex; flex-direction: column; align-items: center;
          padding: 15vh clamp(1rem, 5vw, 4rem) 10vh; text-align: center;
        }
        .scrim-bg {
          position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(30,30,30,0.4) 0%, rgba(0,0,0,0.9) 80%);
          pointer-events: none; z-index: 0;
        }
        .champions-header { position: relative; z-index: 2; max-width: 800px; margin-bottom: 4rem; }
        .eyebrow-center {
          display: inline-block; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.25em;
          text-transform: uppercase; color: var(--accent-blue); margin-bottom: 1.25rem;
        }
        .title-glow {
          font-size: clamp(3rem, 6vw, 4.5rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: #fff;
          margin-bottom: 1.5rem; text-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }
        .lead-text {
          font-size: clamp(1.1rem, 2vw, 1.3rem); color: var(--text-secondary); line-height: 1.6; max-width: 540px; margin: 0 auto;
        }
        .champions-layout {
          position: relative; z-index: 2; width: 100%; max-width: 1200px; display: flex; flex-direction: column; gap: 2rem;
        }
        .champions-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; width: 100%;
        }
      `}} />
      <section id="champions" className="section-champions-wrapper">
        <div className="scrim-bg" aria-hidden="true" />

        <div className="champions-header reveal">
          <span className="eyebrow-center">Hall of Champions</span>
          <h2 className="title-glow">
            Three Seasons.
            <br />
            Three Legends.
          </h2>
          <p className="lead-text">
            Every season has crowned a champion. Season 4 asks — who's next?
          </p>
        </div>

        <div className="champions-layout reveal" data-delay="0.2s">
          <div className="champions-grid">
            {champions.map((champion) => (
              <ChampionCard key={champion.season} champion={champion} />
            ))}
          </div>

          <ChampionCard champion={{ isTeaser: true }} onRegister={onRegister} />
        </div>
      </section>
    </>
  );
}
