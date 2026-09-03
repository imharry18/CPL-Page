import Link from "next/link";

/**
 * The lobby's own bar. The site navbar is deliberately not used here — a lobby
 * is a destination, not another scrolling page, so the only control on it is
 * the way back out.
 */
export default function LobbyBar({ backHref = "/", backLabel = "Back" }) {
  return (
    <header className="lobby-bar">
      <Link className="lobby-back" href={backHref}>
        <span aria-hidden="true">←</span>
        {backLabel}
      </Link>
    </header>
  );
}
