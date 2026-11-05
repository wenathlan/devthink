// # nobrowserstorage.test — the no-browser-storage law of the vault, runnable
// with the house vitest suite:
//   bunx vitest run tests/nobrowserstorage.test.ts
// The 2GB phantom lesson: the old capacity bar read the VISITOR's browser
// quota (navigator.storage.estimate) and rendered the browser's own storage
// budget as the vault's capacity — a number the engine never spoke. The law
// since: the visitor's browser storage is never read, never written, never
// consulted — every capacity, usage and quota figure answers from the vault's
// own database and engine lanes (the quota row of quota.ts, the usage ledger,
// the getQuota door of vaultclient.ts). The battery walks every app source
// file and seals the law end to end: no navigator.storage, no storage quota
// estimate, no localforage, no indexedDB, no sessionStorage anywhere — and
// window.localStorage only in the two pinned cache-mirror seats (labelstore,
// onboardingstate) whose reads are best-effort mirrors of database rows, the
// source of truth never leaving the engine. The tests directory stands
// outside the walk (the batteries mock the mirrors they exercise).

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";

/** the vault package root (the walk starts here). */
const ROOT = join(import.meta.dirname, "..");

/** the directories the walk never enters (the deps, the build and the test
 * mirror mocks stand outside the app source the law binds). */
const SKIP_DIRS = new Set(["node_modules", "dist", "tests", ".git"]);

/** the browser-storage surfaces the law forbids everywhere in app source:
 * the quota estimate lane (the 2GB phantom), the forage and indexed and
 * session seats — the visitor's browser storage is never the vault's. */
const FORBIDDEN = /navigator\.storage|storage\.estimate\s*\(|localforage|indexedDB|sessionStorage/;

/** the localStorage usage shape (a real read or write, not a comment saying
 * the module never touches it). */
const LOCALSTORAGE_USE = /window\.localStorage|localStorage\s*\.\s*(getItem|setItem|removeItem|clear|key)\s*\(/;

/** the two pinned cache-mirror seats — the only lanes allowed to touch the
 * window's localStorage, each a best-effort mirror of database rows (the db
 * stays the source of truth; the cache dies with the session). */
const LOCALSTORAGE_SEATS = new Set(["labelstore.ts", "onboardingstate.ts"]);

/** Walks the app source: every .ts and .tsx file under the vault root except
 * the skipped directories. */
function sourceFiles(dir: string, prefix: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const relative = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) found.push(...sourceFiles(join(dir, entry.name), relative));
      continue;
    }
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) found.push(relative);
  }
  return found;
}

describe("the no-browser-storage law (the visitor's browser storage is never the vault's)", () => {
  const sources = sourceFiles(ROOT, "");

  it("walks a real app source tree, never an empty read", () => {
    assert.ok(sources.length > 40, `the walk covers ${sources.length} app source files`);
    assert.ok(sources.includes("vaultclient.ts") && sources.includes("quota.ts"), "the capacity lanes ride the walk");
  });

  it("never reads the browser quota estimate, forage, indexed or session storage", () => {
    const offenders: string[] = [];
    for (const file of sources) {
      if (FORBIDDEN.test(readFileSync(join(ROOT, file), "utf8"))) offenders.push(file);
    }
    assert.deepEqual(offenders, [], "no app source touches the forbidden browser-storage surfaces");
  });

  it("keeps window.localStorage in the two pinned cache-mirror seats only", () => {
    const offenders: string[] = [];
    for (const file of sources) {
      if (LOCALSTORAGE_SEATS.has(file)) continue;
      if (LOCALSTORAGE_USE.test(readFileSync(join(ROOT, file), "utf8"))) offenders.push(file);
    }
    assert.deepEqual(
      offenders,
      [],
      "localStorage rides only the pinned db-mirror seats (labelstore.ts, onboardingstate.ts)",
    );
    for (const seat of LOCALSTORAGE_SEATS) {
      assert.ok(sources.includes(seat), `the pinned seat ${seat} still exists`);
    }
  });
});

describe("the capacity lane answers from the vault's own engine (the plan-quota db lane)", () => {
  it("carries the quota row law on the database (quota.ts, the drizzle quotas table)", () => {
    const quota = readFileSync(join(ROOT, "quota.ts"), "utf8");
    assert.match(quota, /export function quotaVerdict\(/, "the enforcement verdict answers from the row");
    assert.match(quota, /export function readQuota\(/, "the row read answers from the database");
    assert.match(quota, /export function setQuota\(/, "the owner word rides the row write");
    assert.match(quota, /No browser, no plan literal, no 2GB ghost/, "the phantom refusal stays declared");
    const drizzle = readFileSync(join(ROOT, "drizzle.ts"), "utf8");
    assert.match(drizzle, /export const quotas = sqliteTable\("quotas"/, "the quotas table rides the database");
  });

  it("serves the live quota through the engine door, never the browser", () => {
    const client = readFileSync(join(ROOT, "vaultclient.ts"), "utf8");
    assert.match(client, /getQuota\(project/, "the getQuota door rides the client lane");
    const plans = readFileSync(join(ROOT, "sol/wingets/HomePlanstable.tsx"), "utf8");
    assert.match(plans, /useVaultQuota/, "the plans surface reads the live quota lane");
    assert.match(plans, /the 2GB ghost died/, "the winget keeps the phantom's tombstone");
  });
});
