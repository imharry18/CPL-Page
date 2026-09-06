import { readState } from "@/lib/auction";

/**
 * The auction as it stands, for the room to poll.
 *
 * Read-only and deliberately open — this is what is already on the screen at
 * the front of the hall. Nothing here can change anything; every write goes
 * through /api/auction, which checks admin.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readState();
  return Response.json(state, {
    headers: { "Cache-Control": "no-store" },
  });
}
