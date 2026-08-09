"use client";

export default function Navbar({ onNavigate }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .site-navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000; width: 100%; pointer-events: none;
        }
        .site-navbar-inner {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          width: 100%; padding: 1.25rem clamp(1.5rem, 4vw, 3rem);
          background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: none;
          pointer-events: auto;
        }
        .site-brand {
          background: transparent; border: none; padding: 0; color: #fff; cursor: pointer;
        }
        .site-brand-title {
          position: relative; display: inline-flex; align-items: center;
          font-size: 1.2rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
        }
        .site-brand-title::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: -0.35rem; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.6), transparent);
          opacity: 0.7; transition: opacity 0.3s;
        }
        .site-brand:hover .site-brand-title::after { opacity: 1; }
        .site-nav-cta {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0.7rem 1.2rem; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 999px;
          background: rgba(255, 255, 255, 0.02); color: #fff;
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .site-nav-cta:hover {
          background: rgba(14, 165, 233, 0.1); border-color: rgba(14, 165, 233, 0.4);
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.15); transform: translateY(-1px);
        }
      `}} />
      <header className="site-navbar">
        <div className="site-navbar-inner">
          <button
            type="button"
            className="site-brand"
            onClick={() => onNavigate("hero")}
            aria-label="Campus Premier League home"
          >
            <span className="site-brand-title">Campus Premier League</span>
          </button>

          <button
            type="button"
            className="site-nav-cta"
            onClick={() => onNavigate("champions")}
          >
            Hall of Champions
          </button>
        </div>
      </header>
    </>
  );
}
