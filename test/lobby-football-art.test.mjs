import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("lobby cards use dedicated football artwork", async () => {
  const cards = await readFile(new URL("../data/lobbyCards.js", import.meta.url), "utf8");

  for (const id of ["teams", "auction", "players", "matches", "rules"]) {
    assert.match(cards, new RegExp(`id: "${id}"[\\s\\S]*?image: "/lobby/football/${id}\\.jpg"`));
  }
});
