import { access } from "node:fs/promises";
import path from "node:path";

/**
 * Is this machine the one running the auction?
 *
 * True when a `.admin` file sits in the project root. That file is gitignored,
 * so it exists only on your own copy — clone the repo anywhere else, or deploy
 * it, and there is no file, so there is no admin.
 *
 * Two things follow from that, and both matter:
 *
 *   1. Admin controls are decided on the SERVER. Call this in a server
 *      component and render the controls inside the branch, so the markup for
 *      them is never sent to a browser that should not have them.
 *
 *   2. Every route that CHANGES something must call this itself and refuse
 *      when it is false. Hiding a button is not access control — anything the
 *      page renders, a visitor can un-hide. The check on the write is the
 *      thing that actually protects it.
 *
 * The production guard is belt and braces: a deployed build has no `.admin`
 * file anyway, but if one were ever committed by accident this still refuses.
 */

const FILE = path.join(process.cwd(), ".admin");

export async function isAdmin() {
  if (process.env.NODE_ENV === "production") return false;

  try {
    await access(FILE);
    return true;
  } catch {
    return false;
  }
}
