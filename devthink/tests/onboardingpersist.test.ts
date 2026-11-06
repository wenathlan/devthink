/**
 * onboardingpersist.test.ts — the DB round trip of the entry flow (W2-B):
 * the ordinal flow entry must persist IN THE BANK, never in the browser.
 * The chain under test: storage.setonboardingstage /
 * getonboardingstate (the accessors the /api/v1/onboarding lane calls)
 * writing through the lazy Prisma client into a real pushed sqlite database
 * — the same shape the server lane serves, so a stage raised on one page
 * load answers on the next one from the row, not from any browser seat.
 * The browser mirror (localStorage) is a cache only; nothing in this chain
 * reads or writes it — the storage lane has no window dependency at all.
 */
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const exec = promisify(execFile);

const persistdir = mkdtempSync(join(tmpdir(), "onboarding-persist-"));
process.env.DEVTHINK_DATABASE_URL = `file:${join(persistdir, "test.db")}`;

beforeAll(async () => {
  // the generated prisma client the lazy database proxy resolves: the same
  // idempotent generate the repo scripts run (a fresh checkout lands the
  // client before the first write), then the push lays the schema into the
  // isolated database
  const appdir = join(import.meta.dirname, "..");
  await exec("bunx", ["prisma", "generate", "--schema", "schema.prisma"], {
    cwd: appdir,
    timeout: 120000,
  });
  await exec(
    "bunx",
    ["prisma", "db", "push", "--schema", "schema.prisma", "--url", process.env.DEVTHINK_DATABASE_URL ?? ""],
    {
      cwd: appdir,
      env: { ...process.env, DEVTHINK_DATABASE_URL: process.env.DEVTHINK_DATABASE_URL },
      timeout: 120000,
    },
  );
  if (!existsSync(join(persistdir, "test.db"))) throw new Error("db push produced no database");
}, 150000);

afterAll(() => {
  rmSync(persistdir, { recursive: true, force: true });
});

// imported after the env is pinned — the lazy client reads the url on the
// first database touch, so every call below resolves the pushed database
const { db, getonboardingstate, setonboardingstage } = await import("../storage.js");

/** a visitor token the lane accepts (the same shape the browser mints). */
const VISITOR = "vpersistroundtrip01";

describe("the onboarding flow entry persists in the bank (never the browser)", () => {
  it("answers the defaults for an unknown visitor", async () => {
    expect(await getonboardingstate("vneverseen01")).toBeNull();
  });

  it("writes the intro stage into the OnboardingState row", async () => {
    const raised = await setonboardingstage(VISITOR, "intro");
    expect(raised).toEqual({ introseen: true, onboardingseen: false });
    // the row itself, read straight from the database (the bank, not any
    // browser seat): one row per visitor keyed on the token
    const row = await db.onboardingState.findUnique({ where: { visitor: VISITOR } });
    expect(row, "the stage write landed a row in the bank").toBeTruthy();
    expect(row?.introseen).toBe(true);
    expect(row?.onboardingseen).toBe(false);
  });

  it("reads the persisted row back on the next page load", async () => {
    // the accessor a fresh mount answers from: the database row the first
    // write landed — a page reload (or another device) sees the same flags
    expect(await getonboardingstate(VISITOR)).toEqual({ introseen: true, onboardingseen: false });
  });

  it("raises the flags upward only — the onboarding stage implies the intro", async () => {
    const raised = await setonboardingstage(VISITOR, "onboarding");
    expect(raised).toEqual({ introseen: true, onboardingseen: true });
    const row = await db.onboardingState.findUnique({ where: { visitor: VISITOR } });
    expect(row?.introseen).toBe(true);
    expect(row?.onboardingseen).toBe(true);
    // a repeated intro stage never lowers the onboarding flag
    const again = await setonboardingstage(VISITOR, "intro");
    expect(again).toEqual({ introseen: true, onboardingseen: true });
  });

  it("keeps every visitor on its own row (the upsert never duplicates)", async () => {
    await setonboardingstage("vsecondvisitor02", "intro");
    await setonboardingstage("vsecondvisitor02", "intro");
    const count = await db.onboardingState.count({ where: { visitor: "vsecondvisitor02" } });
    expect(count).toBe(1);
    const total = await db.onboardingState.count();
    expect(total).toBe(2); // VISITOR + the second visitor, one row each
  });
});
