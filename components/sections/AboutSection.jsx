import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="section">
      <div className="wrap">
        <div className="head reveal">
          <p className="eyebrow">The league</p>
          <h2 className="display display-l head-title">Not a department cup.</h2>
          <div className="seam-rule head-rule" />
        </div>

        <div className="about-grid">
          <div className="about-body reveal">
            <p className="lede">
              It started in 2025 on a basketball court, run by hostel players who were
              tired of waiting to be picked for something else. It has gone out every
              semester since, and moved to the football ground in Season 2.
            </p>
            <p className="lede">
              Hostel players form the core. Outsiders join with permission. After the
              toss, nobody’s year matters — that one rule is the whole league.
            </p>
            <div className="hero-actions">
              <a className="btn" href="#teams">
                See the teams
              </a>
              <Link className="btn btn-primary" href="/lobby">
                Season 4
              </Link>
            </div>
          </div>

          <dl className="about-facts reveal" style={{ "--delay": "0.12s" }}>
            <div className="fact">
              <dt>First season</dt>
              <dd>2025</dd>
            </div>
            <div className="fact">
              <dt>Teams per season</dt>
              <dd>6—8</dd>
            </div>
            <div className="fact">
              <dt>Plays</dt>
              <dd>Every semester</dd>
            </div>
            <div className="fact">
              <dt>Entry fee</dt>
              <dd>₹100</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
