import { watch } from "node:fs";
import path from "node:path";

import { STATE_FILE, readState } from "@/lib/auction";

/**
 * One watcher on the state file, however many boards are connected.
 *
 * The first version opened an fs.watch per connection. That works until it
 * does not: a few reloads leave several streams open, a watch fails, and that
 * one connection quietly falls back to polling while its neighbours stay live
 * — a board a second behind the room with nothing to show it is wrong.
 *
 * So the watcher is a singleton and connections are subscribers. It is created
 * on the first listener and closed after the last one leaves.
 *
 * Module state survives between requests in a running server, which is exactly
 * what this needs and exactly why it must never hold anything but a cache of
 * what is on disk.
 */

const listeners = new Set();
let watcher = null;
let debounce = null;

function fanout(state) {
  for (const send of listeners) {
    try {
      send(state);
    } catch {
      // A dead connection is dropped on its own unsubscribe; a throw here
      // must not stop the other boards being told.
    }
  }
}

async function publish() {
  fanout(await readState());
}

/**
 * Push a state to every board right now.
 *
 * The write path calls this the moment the ledger is saved, so a press reaches
 * the room without waiting for the filesystem to report the change. The
 * watcher below is then only a safety net — for an edit made outside the app.
 */
export function publishNow(state) {
  fanout(state);
}

function start() {
  if (watcher) return;
  try {
    /* The directory, not the file. writeState saves to a neighbouring file and
       renames it over the top, which is what makes the save atomic — but a
       rename swaps the inode, and a watch held on the old file goes deaf.
       Watching the directory survives that. */
    watcher = watch(path.dirname(STATE_FILE), (_event, filename) => {
      /* Both names count. The save writes "auctionState.json.tmp" and renames
         it into place, and macOS reports that rename against the temp name as
         often as the real one — filtering to the real name alone threw the
         event away and left the board on its five-second safety net. */
      const target = path.basename(STATE_FILE);
      if (filename && filename !== target && filename !== `${target}.tmp`) {
        return;
      }
      // One write can fire the watcher more than once; coalesce so every
      // board is not sent three copies of the same state.
      clearTimeout(debounce);
      debounce = setTimeout(publish, 10);
    });
  } catch {
    // No file yet — the first lot creates it. Retry on the next subscriber.
    watcher = null;
  }
}

/** Subscribe to state changes. Returns the unsubscribe. */
export function subscribe(send) {
  listeners.add(send);
  start();

  return () => {
    listeners.delete(send);
    if (listeners.size === 0) {
      watcher?.close();
      watcher = null;
      clearTimeout(debounce);
    }
  };
}
