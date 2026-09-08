import LobbyBar from "@/components/lobby/LobbyBar";
import RevealLock from "@/components/lobby/RevealLock";

/**
 * The shell every card opens into: the lobby's bar, a title, and the countdown
 * that says when the thing on this page appears. Four screens use it, which is
 * why it exists — the alternative is the same twelve lines copied four times.
 *
 * `fill` pins the screen to the viewport the way the lobby itself is pinned, so
 * whatever is passed as children gets the leftover height instead of sitting at
 * its natural size with empty page underneath.
 */
export default function LobbySub({
  eyebrow,
  title,
  what,
  reveal,
  // A screen with nothing to list says so in one big line instead, and the
  // countdown would only repeat it.
  lock = true,
  /* Something to put on the right of the heading, where the countdown would
     otherwise be. The teams page hangs its FateGrid link here. */
  action = null,
  fill = false,
  // A screen whose heading has to change while you watch it renders its own,
  // and turns this one off — the auction's title follows the leading bidder.
  head = true,
  children,
}) {
  const body = (
    <>
      <LobbyBar backHref="/lobby" backLabel="Lobby" />

      <main className="lobby">
        {/* Title left, countdown right — one row, so the clock reads as part of
            the heading rather than as a banner stretched across the page. */}
        {head && (
          <div className="sub-head">
            <div className="lobby-head">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="display lobby-title">{title}</h1>
            </div>

            {lock && <RevealLock reveal={reveal} what={what} />}
            {!lock && action}
          </div>
        )}

        {children}
      </main>
    </>
  );

  return (
    <>
      <div className="backdrop backdrop-vignette" aria-hidden="true" />
      <div className="backdrop backdrop-grain" aria-hidden="true" />

      {fill ? <div className="lobby-shell">{body}</div> : body}
    </>
  );
}
