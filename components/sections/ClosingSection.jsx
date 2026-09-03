import Link from "next/link";

export default function ClosingSection({ dates }) {
  return (
    <section id="closing" className="section closing">
      <p className="eyebrow reveal">Season 04</p>

      <h2 className="display display-xl closing-title">
        <span className="line-mask">
          <span>The lobby</span>
        </span>
        <span className="line-mask" style={{ "--delay": "0.1s" }}>
          <span className="lit">is open.</span>
        </span>
      </h2>

      <p className="lede reveal" style={{ "--delay": "0.2s" }}>
        Entries are closed. Teams, the auction on {dates[0].day}{" "}
        {dates[0].month}, the full twelve-match day, the player pool and the
        fee are all in one place.
      </p>

      <div className="register-actions reveal" style={{ "--delay": "0.3s" }}>
        <Link className="btn btn-primary btn-lg" href="/lobby">
          Season 4
        </Link>
      </div>

      <footer className="foot">
        <span>Campus Premier League © 2026</span>
        <span>Est. 2025 · Every semester since</span>
      </footer>
    </section>
  );
}
