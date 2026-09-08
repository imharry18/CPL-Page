"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The one way back to zero, and the only one.
 *
 * It sits in the lobby rather than inside the auction because it is not the
 * auction's button: it clears the fixture and the FateGrid as well. Everything
 * those three screens hold is written to file and stays there — the draw made
 * in front of the room is the draw for the rest of the night — so this is what
 * ends a rehearsal and starts the real thing.
 *
 * Rendered only for the machine running the night; the route refuses anyone
 * else regardless, because a hidden button is not a lock.
 */
export default function RestartSeason() {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function restart() {
    setBusy(true);
    try {
      const response = await fetch("/api/restart", { method: "POST" });
      if (!response.ok) throw new Error(await response.text());
      setAsking(false);
      // Every page reads its file on the server, so the way to show the wipe
      // is to ask for them again rather than to patch anything here.
      router.refresh();
    } catch (error) {
      console.error("[restart] could not clear the season:", error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="lobby-restart num"
        onClick={() => setAsking(true)}
      >
        Restart
      </button>

      {asking && (
        <div
          className="confirm-scrim"
          onClick={(event) => {
            if (event.target === event.currentTarget) setAsking(false);
          }}
        >
          <div className="confirm" role="dialog" aria-modal="true">
            <p className="confirm-tag num">Restart the season</p>
            <p className="confirm-line">
              The auction, the FateGrid draw and the Openers fixture are all
              deleted. What is left is the eight sides and their captains —
              nothing else about tonight survives.
            </p>
            <p className="confirm-sum num">This cannot be undone</p>
            <div className="confirm-row">
              <button
                type="button"
                className="deck-btn"
                onClick={() => setAsking(false)}
              >
                Keep it
              </button>
              <button
                type="button"
                className="deck-btn is-danger"
                disabled={busy}
                onClick={restart}
              >
                {busy ? "Clearing…" : "Restart everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
