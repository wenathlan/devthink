// # onboardingstate.test — the pure contract of the seen flags: the host
//   validation of the platform base (https only, public hosts only) and the
//   seen-wins stage merge the accessor and the pages share. runnable with
//   vitest: pnpm vitest run tests/onboardingstate.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { entrytarget, hostallowed, mergeStage } from "../cadria/onboardingstate.ts";

describe("onboarding state", () => {
  it("accepts public https bases", () => {
    assert.equal(hostallowed("https://gateway.wenathlan.dev"), true);
    assert.equal(hostallowed("https://gateway.wenathlan.dev/"), true);
    assert.equal(hostallowed("https://cadria.example.com:8443"), true);
  });

  it("refuses plaintext, localhost, loopback and every private or reserved range", () => {
    const refused = [
      "http://gateway.wenathlan.dev",
      "https://localhost",
      "https://localhost:8787",
      "https://app.localhost",
      "https://box.local",
      "https://service.internal",
      "https://127.0.0.1",
      "https://0.0.0.0",
      "https://10.0.0.9",
      "https://172.16.0.1",
      "https://172.31.255.255",
      "https://192.168.1.4",
      "https://169.254.10.10",
      "https://100.64.0.1",
      "https://192.0.2.7",
      "https://198.51.100.7",
      "https://203.0.113.9",
      "https://[::1]",
      "https://[::ffff:127.0.0.1]",
      "https://[fd00::1]",
      "https://[fe80::1]",
      "not a url",
      "",
    ];
    for (const base of refused) assert.equal(hostallowed(base), false, base);
  });

  it("merges stages seen-wins — a stage never unsees", () => {
    const fresh = { introseen: false, onboardingseen: false };
    assert.deepEqual(mergeStage(fresh, "intro"), { introseen: true, onboardingseen: false });
    assert.deepEqual(mergeStage(fresh, "onboarding"), { introseen: false, onboardingseen: true });
    const half = { introseen: true, onboardingseen: false };
    assert.deepEqual(mergeStage(half, "onboarding"), { introseen: true, onboardingseen: true });
    assert.deepEqual(mergeStage(mergeStage(half, "onboarding"), "intro"), {
      introseen: true,
      onboardingseen: true,
    });
  });

  it("never mutates the state it merges", () => {
    const state = { introseen: false, onboardingseen: false };
    mergeStage(state, "intro");
    assert.deepEqual(state, { introseen: false, onboardingseen: false });
  });

  it("hands the entry gate over in the reform order: intro, onboarding, home", () => {
    const unseen = { introseen: false, onboardingseen: false };
    const halfseen = mergeStage(unseen, "intro");
    const fullseen = mergeStage(halfseen, "onboarding");
    assert.equal(entrytarget(unseen), "/intro");
    assert.equal(entrytarget(halfseen), "/onboarding");
    assert.equal(entrytarget(fullseen), "/");
    // the seen-wins merge can never send a visitor back through the flow
    assert.equal(entrytarget(mergeStage(fullseen, "intro")), "/");
  });
});
