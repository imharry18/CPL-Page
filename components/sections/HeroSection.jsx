import Link from "next/link";

export default function HeroSection() {
  // Three near-equal lines, so the headline sets as a solid block of type —
  // and the anaphora gives it the cadence of a chant rather than a slogan.
  const lines = ["Same turf.", "Same ball.", "Same chance."];

  return (
    <section id="top" className="hero">
      <div className="hero-body">
        <p className="hero-status reveal">
          <span className="dot" aria-hidden="true" />
          Season 01 · Entries closed
        </p>

        <h1 className="display hero-title">
          {lines.map((line, i) => (
            <span
              className="line-mask"
              key={line}
              style={{ "--delay": `${0.12 + i * 0.1}s` }}
            >
              <span className={i === 2 ? "lit" : undefined}>{line}</span>
            </span>
          ))}
        </h1>

        <p className="lede hero-lede reveal" style={{ "--delay": "0.45s" }}>
          Inter-hostel football starts this season. Seven squads, one match
          day, and one trophy still waiting for its first name.
        </p>

        <div className="hero-actions reveal" style={{ "--delay": "0.55s" }}>
          {/* One button only. Players and past seasons are both reachable
              from the lobby, so putting them here just competes with it. */}
          <Link className="btn btn-primary btn-lg" href="/lobby">
            Season 1
          </Link>
        </div>
      </div>

      {/* Pinned to the bottom of the viewport, like the strap under a
          broadcast title card. */}
      <div className="hero-rail reveal" style={{ "--delay": "0.7s" }}>
        <p className="hero-scroll" aria-hidden="true">
          Scroll
          <i />
        </p>
      </div>
    </section>
  );
}
