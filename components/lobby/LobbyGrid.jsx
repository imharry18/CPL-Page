import Link from "next/link";

export default function LobbyGrid({ cards }) {
  return (
    <div className="lobby-grid">
      {cards.map((card, i) => {
        const [columns, rows] = card.span.split("x");
        return (
          <Link
            key={card.id}
            /* A two-row tile has the height for a much bigger title; a
               one-row tile does not, and the type has to know which it is. */
            className={rows === "2" ? "tile tile-tall" : "tile"}
            href={card.href}
            style={{
              "--c": columns,
              "--r": rows,
              "--accent": card.accent,
              "--art": `url("${card.image}")`,
              "--art-position": card.position,
              "--delay": `${i * 0.05}s`,
            }}
          >
            <div className="tile-art" aria-hidden="true" />

            <div className="tile-body">
              <p className="tile-eyebrow num">{card.eyebrow}</p>
              <h2 className="display tile-title">{card.title}</h2>
              <p className="tile-note">{card.note}</p>
            </div>

            <p className="tile-stat num">
              {card.stat}
              <span aria-hidden="true">→</span>
            </p>
          </Link>
        );
      })}
    </div>
  );
}
