// # familyurl.test — the address book contract of the family deploy units.
// Run: pnpm vitest run tests/familyurl.test.ts
// The suite watches the promise the directory and the footer make: every
// family member resolves one level above this application, always with the
// trailing slash, and pasted segments or stray slashes land on the same
// address. Pure string shaping — no network, no side effects.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { familyurl } from "../cobaia/familyurl.ts";

describe("the familyurl contract", () => {
  it("resolves a bare slug one level above, with the trailing slash", () => {
    assert.equal(familyurl("vault"), "../vault/");
    assert.equal(familyurl("devthink"), "../devthink/");
  });

  it("trims stray slashes from pasted segments", () => {
    assert.equal(familyurl("/forge/"), "../forge/");
    assert.equal(familyurl("forge/"), "../forge/");
    assert.equal(familyurl("/forge"), "../forge/");
  });

  it("resolves the whole roster the same way", () => {
    const roster = [
      "devthink",
      "saddle",
      "forge",
      "foundry",
      "vault",
      "getry",
      "cadria",
      "debonair",
      "stealthhead",
      "argan",
    ];
    for (const slug of roster) {
      assert.equal(familyurl(slug), `../${slug}/`);
    }
  });
});
