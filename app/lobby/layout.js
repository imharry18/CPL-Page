import LobbyCursor from "@/components/lobby/LobbyCursor";

/**
 * Everything under /lobby shares the reticle.
 *
 * It lives here rather than in the root layout on purpose: the lobby is the
 * part of the site that behaves like a room — a screen at the front of a hall,
 * a board, a draw — and a cursor that behaves like an instrument belongs to
 * that and not to the pages people read.
 */
export default function LobbyLayout({ children }) {
  return (
    <>
      {children}
      <LobbyCursor />
    </>
  );
}
