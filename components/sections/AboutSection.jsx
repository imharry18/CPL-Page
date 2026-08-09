"use client";

export default function AboutSection({ onChampions, onRegister }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .section-about {
          position: relative; width: 100%; padding: 15vh 10%; display: flex; align-items: center; justify-content: flex-start;
          background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 80%); min-height: 100vh; box-sizing: border-box; overflow: hidden;
        }
        .about-card {
          position: relative; padding: 0; max-width: 800px; z-index: 2;
        }
        .about-eyebrow { display: block; font-size: 0.9rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3em; color: var(--accent-blue); margin-bottom: 2rem; text-shadow: 0 4px 12px rgba(14,165,233,0.4); }
        .about-title { font-size: clamp(4rem, 8vw, 7rem); line-height: 0.95; font-weight: 800; color: #fff; margin-bottom: 2.5rem; letter-spacing: -0.04em; text-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        .about-text { font-size: 1.25rem; line-height: 1.7; color: rgba(255,255,255,0.7); margin-bottom: 4rem; max-width: 600px; }
        .about-stats-row { display: flex; align-items: center; gap: 3rem; margin-bottom: 4rem; }
        .about-stat { display: flex; flex-direction: column; gap: 0.4rem; position: relative; }
        .about-stat:not(:last-child)::after {
          content: ""; position: absolute; right: -1.5rem; top: 10%; height: 80%; width: 1px; background: rgba(255,255,255,0.15);
        }
        .about-stat-val { font-size: clamp(3rem, 5vw, 4.5rem); font-weight: 800; color: #fff; line-height: 1; letter-spacing: -0.03em; }
        .about-stat-label { font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; }
        .about-actions { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .btn-outline {
          padding: 1.25rem 3rem; border-radius: 100px; font-weight: 700; cursor: pointer; transition: all 0.3s ease;
          background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); font-size: 0.95rem; letter-spacing: 0.1em; text-transform: uppercase;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.5); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
      `}} />
      <section id="about" className="section-about">
        <div className="about-card reveal">
          <span className="about-eyebrow">The Tournament</span>
          <h2 className="about-title">
            The Best Tournament
            <br />In College.
          </h2>
          <p className="about-text">
            Forget the department cups. The Campus Premier League is where true passion lies. Started by Jammu Hostellites in 2025, we bring together the best players from the hostel and top talents from the outside (with permissions, of course). Every semester, 6-8 teams battle it out, but on the field, we all play like brothers.
          </p>
          <div className="about-stats-row">
            <div className="about-stat">
              <span className="about-stat-val">2025</span>
              <span className="about-stat-label">Inception</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-val">6-8</span>
              <span className="about-stat-label">Teams</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-val">100%</span>
              <span className="about-stat-label">Equal Play</span>
            </div>
          </div>
          <div className="about-actions">
            <button type="button" onClick={onChampions} className="btn-outline">
              Meet the Champions
            </button>
            <button type="button" onClick={onRegister} className="btn-premium">
              Register Now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}