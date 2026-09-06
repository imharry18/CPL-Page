import { subscribe } from "@/lib/auctionBus";
import { readState } from "@/lib/auction";

/**
 * The auction state, pushed the instant it changes.
 *
 * The console writes data/auctionState.json; a single shared watcher picks
 * that up and fans it out to every open board, so the room moves as the button
 * is pressed. On one machine that is tens of milliseconds.
 *
 * Read-only, like /api/auction/state: this only reports what is already on the
 * screen at the front of the hall. Every write goes through /api/auction,
 * which checks admin.
 */
export const dynamic = "force-dynamic";

export async function GET(request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let open = true;

      const frame = (data) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // The client went away between the check and the write.
        }
      };

      const send = (state) => frame(`data: ${JSON.stringify(state)}\n\n`);

      // The current state immediately, so a board that connects mid-lot is not
      // blank until something happens.
      send(await readState());

      const unsubscribe = subscribe(send);

      // Comment frames stop an idle connection being closed under us. They are
      // ignored by EventSource.
      const beat = setInterval(() => frame(": beat\n\n"), 15000);

      /* The dependable path: read the ledger often and send when it differs
         from the last frame this connection saw.

         The push and the file watcher above are both faster, but neither can
         be relied on. In a production build Next bundles each route
         separately, so the write route and this one hold different copies of
         the bus and a direct push never arrives; fs.watch on macOS proved
         just as unreliable across a rename. Reading a small JSON file five
         times a second costs nothing and cannot be defeated by either. */
      let last = null;
      const safety = setInterval(async () => {
        const state = await readState();
        const encoded = JSON.stringify(state);
        if (encoded === last) return;
        last = encoded;
        frame(`data: ${encoded}\n\n`);
      }, 200);

      const close = () => {
        if (!open) return;
        open = false;
        unsubscribe();
        clearInterval(beat);
        clearInterval(safety);
        try {
          controller.close();
        } catch {
          // Already closed by the client going away.
        }
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
