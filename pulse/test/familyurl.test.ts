// # familyurl.test — the address book contract of the pulse studio deploy.
// Run: pnpm vitest run test/familyurl.test.ts
// The studio chrome (the shell rail foot the day the voice lane wakes)
// and the landing footer both lean on the one promise the builder makes:
// every family member resolves one level above this application, always
// with the trailing slash, and pasted segments or stray slashes land on
// the same address. The os itself answers at the family root of the host
// (the pages site root), so the devthink slug resolves to the root —
// never to a "../devthink/" path no deploy carries. pulse itself is never
// its own neighbor: the row links out, so the pulse slug is not special
// here. Pure string shaping — no network, no side effects.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { familyurl } from "../familyurl.ts";

describe("the familyurl contract of the pulse studio door", () => {
  it("resolves a bare slug one level above, with the trailing slash", () => {
    assert.equal(familyurl("vault"), "../vault/");
    assert.equal(familyurl("devthink"), "../");
  });

  it("trims stray slashes from pasted segments", () => {
    assert.equal(familyurl("/saddle/"), "../saddle/");
    assert.equal(familyurl("saddle/"), "../saddle/");
    assert.equal(familyurl("/saddle"), "../saddle/");
  });

  it("resolves the whole roster the same way — the os at the family root, every application at its own segment", () => {
    const roster = [
      "devthink",
      "argan",
      "cadria",
      "debonair",
      "forge",
      "foundry",
      "getry",
      "saddle",
      "stealthhead",
      "vault",
    ];
    for (const slug of roster) {
      assert.equal(familyurl(slug), slug === "devthink" ? "../" : `../${slug}/`);
    }
  });

  it("never folds the studio onto its own door — the pulse slug is a neighbor like any other, not a loop", () => {
    assert.equal(familyurl("pulse"), "../pulse/");
  });
});
