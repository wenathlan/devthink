// # family.test — the family table the chrome rides, runnable with the
// vitest runner:
//   npm test
// Every test watches the promise the row makes: the eight siblings beside
// stealthhead are listed once, every slug resolves through the familyurl
// contract into a climb-one-level url, every member carries the spec §12
// accent with its own dot ink, and no accent ever collides with the banned
// palette.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { FAMILY_ACCENTS, FAMILY_SLUGS, familyrow } from "../stealthhead/family.ts";
import { familyurl } from "../stealthhead/familyurl.ts";

const BANNED = new Set(["#3b82f6", "#2563eb", "#f97316"]);

describe("family table", () => {
  it("lists the eight siblings beside stealthhead, never stealthhead itself", () => {
    assert.deepEqual(FAMILY_SLUGS, ["argan", "cadria", "debonair", "forge", "foundry", "getry", "saddle", "vault"]);
    assert.ok(!FAMILY_SLUGS.includes("stealthhead"));
    assert.ok(!FAMILY_SLUGS.includes("devthink"));
  });

  it("answers an accent for every listed sibling", () => {
    for (const slug of FAMILY_SLUGS) {
      const member = FAMILY_ACCENTS[slug];
      assert.ok(member, `${slug} must carry an accent`);
      assert.equal(member.slug, slug);
      assert.match(member.accent, /^#[0-9a-f]{6}$/);
      assert.match(member.dotInk, /^#[0-9a-f]{6}$/);
    }
    // the table holds exactly the siblings — no orphan accents
    assert.deepEqual(Object.keys(FAMILY_ACCENTS).sort(), [...FAMILY_SLUGS].sort());
  });

  it("resolves every member through the familyurl contract", () => {
    for (const slug of FAMILY_SLUGS) {
      assert.equal(familyurl(slug), `../${slug}/`);
    }
  });

  it("strips decorative slashes and normalizes the slug", () => {
    assert.equal(familyurl("/cadria/"), "../cadria/");
    assert.equal(familyurl("  getry  "), "../  getry  /");
  });

  it("keeps the spec §12 accents stable", () => {
    assert.equal(FAMILY_ACCENTS.argan.accent, "#34d8a8");
    assert.equal(FAMILY_ACCENTS.cadria.accent, "#f472b6");
    assert.equal(FAMILY_ACCENTS.debonair.accent, "#d9962e");
    assert.equal(FAMILY_ACCENTS.forge.accent, "#a2cb3a");
    assert.equal(FAMILY_ACCENTS.foundry.accent, "#2fb8b5");
    assert.equal(FAMILY_ACCENTS.getry.accent, "#8b5cf6");
    assert.equal(FAMILY_ACCENTS.saddle.accent, "#e86f2d");
    assert.equal(FAMILY_ACCENTS.vault.accent, "#a3d7e6");
  });

  it("never ships a banned hue in the row", () => {
    for (const member of familyrow()) {
      assert.ok(!BANNED.has(member.accent), `${member.slug} rides a banned accent`);
    }
  });

  it("builds the rail row in slug order without gaps", () => {
    const row = familyrow();
    assert.equal(row.length, FAMILY_SLUGS.length);
    assert.deepEqual(
      row.map((member) => member.slug),
      [...FAMILY_SLUGS],
    );
  });

  it("keeps every dot ink readable on its own accent (the ink is darker)", () => {
    for (const member of familyrow()) {
      const lum = (hex: string): number => {
        const channel = (offset: number) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
      };
      assert.ok(lum(member.dotInk) < lum(member.accent), `${member.slug} dot ink must be darker than its accent`);
    }
  });
});
