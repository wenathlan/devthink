// # onboardingstore.test — the storage contract of the seen flags: the vault
//   factory every family app rides over its own lane (the undefined read
//   before the first write, the flow-order stage write, the idempotent
//   re-mark, the cross-instance persistence over one file and the drifted
//   table-name law the singular seats keep). runnable with the house vitest
//   suite:
//   bunx vitest run test/onboardingstore.test.ts
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "vitest";
import { createOnboardingStore } from "../onboardingstore.ts";
import { openStorageLane, type StorageLane } from "../storage.ts";

const tempdirs: string[] = [];

function tempdir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "onboardingstore-"));
  tempdirs.push(dir);
  return dir;
}

/** opens one throwaway lane over a fresh temp file (the family seat driver). */
function lane(dir: string, name: string): StorageLane {
  return openStorageLane({ url: path.join(dir, name) });
}

afterEach(() => {
  while (tempdirs.length > 0) {
    const dir = tempdirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("the onboarding store", () => {
  it("answers undefined for a visitor that never wrote", () => {
    const store = createOnboardingStore(lane(tempdir(), "fresh.db"));
    assert.equal(store.getOnboardingState("stranger"), undefined);
  });

  it("marks the intro stage seen alone", () => {
    const store = createOnboardingStore(lane(tempdir(), "intro.db"));
    store.setOnboardingStage("visitor", "intro");
    assert.deepEqual(store.getOnboardingState("visitor"), { introseen: true, onboardingseen: false });
  });

  it("marks the onboarding stage seen with the intro it implies (the flow order)", () => {
    const store = createOnboardingStore(lane(tempdir(), "onboarding.db"));
    store.setOnboardingStage("visitor", "onboarding");
    assert.deepEqual(store.getOnboardingState("visitor"), { introseen: true, onboardingseen: true });
  });

  it("re-marks idempotently — a stage seen anywhere stays seen", () => {
    const store = createOnboardingStore(lane(tempdir(), "idempotent.db"));
    store.setOnboardingStage("visitor", "intro");
    store.setOnboardingStage("visitor", "intro");
    assert.deepEqual(store.getOnboardingState("visitor"), { introseen: true, onboardingseen: false });
    store.setOnboardingStage("visitor", "onboarding");
    // a replayed earlier stage never unsees the later one (the MAX arms)
    store.setOnboardingStage("visitor", "intro");
    assert.deepEqual(store.getOnboardingState("visitor"), { introseen: true, onboardingseen: true });
  });

  it("answers the whole mirrored row beside the flags", () => {
    const store = createOnboardingStore(lane(tempdir(), "row.db"));
    store.setOnboardingStage("visitor", "intro");
    const row = store.getOnboardingRow("visitor");
    assert.equal(row?.visitor, "visitor");
    assert.equal(row?.introseen, true);
    assert.equal(row?.onboardingseen, false);
    assert.equal(typeof row?.updatedAt, "string");
  });

  it("persists across two store instances over the same file", () => {
    const dir = tempdir();
    const file = "persist.db";
    const first = createOnboardingStore(lane(dir, file));
    first.setOnboardingStage("visitor", "intro");
    const second = createOnboardingStore(lane(dir, file));
    assert.deepEqual(second.getOnboardingState("visitor"), { introseen: true, onboardingseen: false });
    second.setOnboardingStage("visitor", "onboarding");
    assert.deepEqual(second.getOnboardingState("visitor"), { introseen: true, onboardingseen: true });
  });

  it("keeps the drifted table name an app pins (the singular law)", () => {
    const onboarding = lane(tempdir(), "drifted.db");
    const store = createOnboardingStore(onboarding, { tableName: "onboarding_state" });
    store.setOnboardingStage("visitor", "onboarding");
    assert.deepEqual(store.getOnboardingState("visitor"), { introseen: true, onboardingseen: true });
    // the row lands on the pinned table, never on the family default
    assert.ok(
      onboarding.queryOne<{ visitor: string }>("SELECT visitor FROM onboarding_state WHERE visitor = ?", ["visitor"]),
    );
    const defaults = onboarding.queryAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'onboarding_states'",
    );
    assert.equal(defaults.length, 0);
  });
});
