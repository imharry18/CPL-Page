import { permanentRedirect } from "next/navigation";

/**
 * The pool moved under the lobby. This stays so that anything already pointing
 * at /players — a shared link, a message in a group chat — still lands.
 */
export default function PlayersRedirect() {
  permanentRedirect("/lobby/players");
}
