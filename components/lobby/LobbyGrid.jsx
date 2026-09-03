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

            {/* The name and the arrow, and nothing else. The artwork says the
                rest, and the page behind the tile says it properly. */}
            <h2 className="display tile-title">{card.title}</h2>
            <span className="tile-go" aria-hidden="true">
              →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
