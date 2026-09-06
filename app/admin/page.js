import AuctionConsole from "@/components/admin/AuctionConsole";
import { SEASON_4_ICONIC } from "@/data/season4Iconic";
import { SEASON_4_SIDES } from "@/data/season4Sides";
import { isAdmin } from "@/lib/admin";
import { photoFor, photoIndex, readOrder, readState } from "@/lib/auction";
import { getPlayers } from "@/lib/players";

export const metadata = {
  title: "Auction console",
  robots: { index: false, follow: false },
};

// The console must never be served from cache: it is the live state of the
// room, and a stale board is worse than no board.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Decided on the server, so the controls are not merely hidden — the markup
  // for them is never sent to a browser that should not have it.
  if (!(await isAdmin())) {
    return (
      <main className="admin-locked">
        <p className="admin-locked-tag num">Auction console</p>
        <h1 className="display">Not this machine</h1>
        <p>
          The console runs only where a <code>.admin</code> file sits in the
          project root. Nothing here is available on a deployed build.
        </p>
      </main>
    );
  }

  const [{ players }, state, photos, order] = await Promise.all([
    getPlayers(),
    readState(),
    photoIndex(),
    readOrder(),
  ]);

  // The photograph is resolved here rather than in the browser, because the
  // filenames come off a Drive export and the matching is fuzzy.
  const pool = players.map((player) => ({
    ...player,
    photo: photoFor(photos, player.name),
  }));

  return (
    <AuctionConsole
      sides={SEASON_4_SIDES}
      players={pool}
      initial={state}
      order={order}
      iconic={SEASON_4_ICONIC}
    />
  );
}
