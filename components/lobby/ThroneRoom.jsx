import Image from "next/image";

/**
 * The Winner tab: the prize in the spotlight, and eight sides with a claim to it.
 *
 * The page deliberately has no accent colour of its own. Every colour on it
 * belongs to one of the sides, because the only question it asks is whose
 * colour ends up on the seat. The spotlight walking the crests is staggered
 * CSS rather than a timer — nothing here needs to be a client component.
 */
export default function ThroneRoom({ sides, crownedOn }) {
  return (
    <section className="throne">
      <div className="throne-hall">
        <span className="throne-beam" aria-hidden="true" />
        <div className="trophy-stage">
          <span className="trophy-orbit" aria-hidden="true" />
          <Image
            className="trophy-art"
            src="/lobby/championship-trophy.png"
            alt="The Campus Premier League championship trophy"
            width={1024}
            height={1536}
            sizes="(max-width: 640px) 68vw, 23rem"
            priority
          />
        </div>
      </div>

      <p className="throne-eyebrow num">Crowned {crownedOn}</p>
      <h2 className="throne-ask display">Who lifts the trophy?</h2>
      <p className="throne-sub">Eight sides. One champion.</p>

      <ul className="claimants">
        {sides.map((side, i) => (
          <li
            className="claimant"
            key={side.no}
            style={{
              "--team": side.color,
              "--team-lit": side.colorLit,
              /* The light moves down the line one side at a time; each waits
                 its turn by index. */
              "--turn": i,
            }}
          >
            <span
              className="claimant-crest"
              style={side.logo ? { backgroundImage: `url("${side.logo}")` } : undefined}
              aria-hidden="true"
            />
            <span className="claimant-name">{side.name || "To be named"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
