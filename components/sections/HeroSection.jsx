"use client";

export default function HeroSection({ onRegister }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .section-hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 8vh clamp(1rem, 5vw, 4rem); position: relative; box-sizing: border-box; text-align: center;
        }
        .hero-stage {
          position: relative; width: 100%; max-width: 1000px;
          padding: clamp(3rem, 6vw, 5rem) 0; margin: 0 auto;
        }
        .hero-stage > * { position: relative; z-index: 1; }
        .hero-kicker {
          font-size: 0.75rem; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase;
          color: var(--accent-blue); margin-bottom: 1.25rem;
        }
        .hero-title {
          font-size: clamp(3.5rem, 9vw, 7.5rem); font-weight: 800; letter-spacing: -0.05em; line-height: 0.9;
          color: #fff; margin-bottom: 2rem; text-shadow: 0 8px 40px rgba(0,0,0,0.6);
        }
        .hero-title .accent-word {
          background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #fff 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.35rem); color: var(--text-secondary); font-weight: 400;
          max-width: 640px; margin: 0 auto 3rem; line-height: 1.6; text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .hero-chip-row {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 0.8rem; margin-bottom: 2.5rem;
        }
        .hero-chip {
          padding: 0.6rem 1.2rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.85); font-size: 0.7rem;
          font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .hero-cta-group { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
        .btn-premium {
          padding: 1.15rem 2.75rem; font-family: var(--font-primary), sans-serif; font-size: 0.9rem;
          font-weight: 700; color: #000; background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
          border: none; border-radius: 100px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 12px 30px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255,255,255,0.5); letter-spacing: 0.05em; text-transform: uppercase;
        }
        .btn-premium:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 20px 40px rgba(14, 165, 233, 0.4); }
      `}} />
      <section id="hero" className="section-hero">
        <div className="hero-stage">
          <p className="hero-kicker">STARTED BY JAMMU HOSTELLITES</p>
          <h1 className="hero-title">
            Make your name
            <br />
            with your <span className="accent-word">skills</span>
          </h1>
          <p className="hero-subtitle">
            Play like brothers, no junior no senior, just cricket. Founded by Harish Chouhan, this is the ultimate battleground where everyone is equal on the pitch.
          </p>
          <div className="hero-chip-row" aria-hidden="true">
            <span className="hero-chip">Started in 2025</span>
            <span className="hero-chip">Every Semester</span>
            <span className="hero-chip">6-8 Elite Teams</span>
          </div>
          <div className="hero-cta-group">
            <button type="button" className="btn-premium" onClick={onRegister}>
              Register Now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
