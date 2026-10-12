/**
 * onboardingstate.test.ts — the pure contract of the seen flags: the host
 * validation of the platform base (https only, public hosts only, mapped
 * ipv6 normalized) and the seen-wins stage merge the accessor and the
 * pages share.
 *
 * run with vitest: vitest run tests/onboardingstate.test.ts
 */

import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { hostallowed, mergeStage } from "../onboardingstate.ts";

describe("onboarding state", () => {
  it("accepts public https bases", () => {
    assert.equal(hostallowed("https://gateway.wenathlan.dev"), true);
    assert.equal(hostallowed("https://gateway.wenathlan.dev/"), true);
    assert.equal(hostallowed("https://cobaia.example.com:8443"), true);
  });

  it("refuses plaintext, localhost, loopback and every private or reserved range", () => {
    const refused = [
      "http://gateway.wenathlan.dev",
      "https://localhost",
      "https://localhost:8787",
      "https://app.localhost",
      "https://box.local",
      "https://service.internal",
      "https://studio.home.arpa",
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
      "https://198.18.0.4",
      "https://224.0.0.1",
      "https://[::1]",
      "https://[::]",
      "https://[::ffff:127.0.0.1]",
      "https://[fd00::1]",
      "https://[fe80::1]",
      "not a url",
      "",
    ];
    for (const base of refused) assert.equal(hostallowed(base), false, base);
  });

  it("normalizes the mapped ipv6 spelling the url parser produces", () => {
    // `https://[::ffff:8.8.8.8]` arrives at the validator as the hex form
    assert.equal(hostallowed("https://[::ffff:0808:0808]"), true);
    assert.equal(hostallowed("https://[::ffff:7f00:1]"), false);
  });

  it("merges stages seen-wins — a stage never unsees", () => {
    const fresh = { introseen: false, onboardingseen: false };
    assert.deepEqual(mergeStage(fresh, "intro"), { introseen: true, onboardingseen: false });
    assert.deepEqual(mergeStage(fresh, "onboarding"), { introseen: true, onboardingseen: true });
    const half = { introseen: true, onboardingseen: false };
    assert.deepEqual(mergeStage(half, "onboarding"), { introseen: true, onboardingseen: true });
  });

  it("never mutates the state it merges", () => {
    const state = { introseen: false, onboardingseen: false };
    mergeStage(state, "onboarding");
    assert.deepEqual(state, { introseen: false, onboardingseen: false });
  });
});
