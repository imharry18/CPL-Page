"use client";

export default function RegisterSection({ onNotify, onTop }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .section-register {
          min-height: 90vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 15vh clamp(1rem, 5vw, 4rem) 5vh; position: relative;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 70%, #000 100%);
        }
        .section-register::before {
          content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 50% 100%, rgba(14, 165, 233, 0.15) 0%, transparent 60%); pointer-events: none;
        }
        .register-content { position: relative; z-index: 2; max-width: 1000px; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .reg-badge {
          display: inline-block; padding: 0.8rem 1.75rem; background: rgba(14, 165, 233, 0.05); border: 1px solid rgba(14, 165, 233, 0.4);
          color: #0ea5e9; border-radius: 100px; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 3rem;
          box-shadow: 0 0 20px rgba(14,165,233,0.1);
        }
        .reg-title { font-size: clamp(4rem, 10vw, 8rem); font-weight: 800; letter-spacing: -0.05em; line-height: 0.95; color: #fff; margin-bottom: 2rem; text-shadow: 0 10px 50px rgba(0,0,0,0.8); }
        .reg-sub { font-size: clamp(1.2rem, 2.5vw, 1.5rem); color: rgba(255,255,255,0.6); margin-bottom: 4rem; max-width: 600px; line-height: 1.6; }
        .reg-actions { display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
        .btn-top {
          padding: 1.25rem 3rem; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 100px;
          font-size: 0.95rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-top:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.5); transform: translateY(-2px); }
        .reg-divider { width: 1px; height: 80px; background: linear-gradient(180deg, transparent, rgba(14, 165, 233, 0.5), transparent); margin-bottom: 2rem; }
        .reg-meta { font-size: 0.75rem; color: rgba(255,255,255,0.3); letter-spacing: 0.2em; text-transform: uppercase; }
      `}} />
      <section id="register" className="section-register">
        <div className="register-content reveal">
          <span className="reg-badge">Registrations Opening For September</span>
          <h2 className="reg-title">
            Season 4
            <br />
            is Coming.
          </h2>
          <p className="reg-sub">
            Get ready for the biggest semester yet. Gather your squad, secure your permissions, and prepare to make your name this September.
          </p>
          <div className="reg-actions">
            <button type="button" className="btn-premium" onClick={onNotify}>
              Get Notified
            </button>
            <button type="button" className="btn-top" onClick={onTop}>
              Back to Top
            </button>
          </div>

          <p className="reg-meta">Campus Premier League © 2026 — All Rights Reserved</p>
        </div>
      </section>
    </>
  );
}
