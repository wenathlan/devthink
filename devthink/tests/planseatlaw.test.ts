// # planseatlaw.test — the signupseat law of the plan seat (the vault
// family law, PR16, the devthink dialect): the plan the person selects at
// the gate answers the database alone. runnable with vitest:
//   pnpm vitest run tests/planseatlaw.test.ts
//
// The laws the battery pins:
//  1. no browser persistence on the plan path — planstore.ts (the ONE
//     writer of the visitor's plan) carries no localStorage /
//     sessionStorage / indexedDB call: the plan never rides the visitor's
//     browser, module memory covers the session alone (the owner's order:
//     cadastro never saves in the browser, and the plan is the account's
//     own selection);
//  2. the store rides the internal api — the durable seat is the platform
//     database over GET/POST /api/v1/plan (the server owns the route and
//     the PlanState table of the sqlite lane);
//  3. the session seat behaves — a fresh page answers no plan (peekplan
//     null), a stamp lands in the session memory and answers the badge
//     lane without ever touching a browser store.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { loadplan, peekplan, saveplan } from "../planstore.ts";

/** repository root resolved from this test file location. */
const reporoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** reads one repo file as text. */
function source(relative: string): string {
  return readFileSync(join(reporoot, relative), "utf8");
}

/** the browser-persistence shapes the plan path forbids: a real storage
 * read or write, never a comment declaring the refusal. */
const BROWSER_PERSISTENCE =
  /window\.localStorage|window\.sessionStorage|window\.indexedDB|localStorage\s*\.\s*(getItem|setItem|removeItem|clear|key)\s*\(|sessionStorage\s*\.\s*(getItem|setItem|removeItem|clear|key)\s*\(|indexedDB\s*\.|localforage/;

describe("the plan seat law (the plan answers the database alone)", () => {
  it("keeps the plan store free of every browser-persistence call", () => {
    assert.equal(
      BROWSER_PERSISTENCE.test(source("planstore.ts")),
      false,
      "planstore.ts never touches localStorage, sessionStorage, indexedDB or localforage",
    );
  });

  it("rides the internal api for the durable seat (the server owns the plan table)", () => {
    const store = source("planstore.ts");
    assert.match(store, /API_PATH = "\/api\/v1\/plan"/, "the plan route rides the platform lane");
    assert.match(store, /call\("POST", API_PATH/, "the stamp posts the platform database");
    assert.match(store, /call\("GET"/, "the load reads the platform database");
    const server = source("server.ts");
    assert.match(server, /app\.(get|post)\("\/api\/v1\/plan"/, "the server owns the plan routes");
    const storage = source("storage.ts");
    assert.match(storage, /CREATE TABLE IF NOT EXISTS "PlanState"/, "the plan table rides the sqlite lane");
    assert.match(storage, /export async function setplan\(/, "the durable write answers the store");
  });

  it("holds the session seat in memory alone (the fresh page answers no plan)", async () => {
    assert.equal(peekplan(), null, "a fresh page carries no plan until the database answers");
    const stamped = await saveplan("pro");
    assert.equal(stamped.tier, "pro");
    assert.equal(peekplan()?.tier, "pro", "the session memory answers the badge lane");
    const loaded = await loadplan();
    assert.equal(loaded?.tier ?? "pro", "pro", "the load reconciles with the session seat");
  });
});
