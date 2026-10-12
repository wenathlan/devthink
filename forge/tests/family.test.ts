// # family.test — the family table the chrome rides, runnable with the node
// built-in runner (no dependencies, no install):
//   node --test tests/family.test.ts
// Every test watches the promise the row makes: the nine siblings beside
// forge are listed once, every slug resolves through the familyurl contract
// into a climb-one-level url, every member carries the spec §12 accent with
// its own dot ink, and no accent ever collides with the banned palette.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAMILY_ACCENTS, FAMILY_SLUGS, familyAccentOf, familyrow } from "../family.ts";
import { familyurl } from "../familyurl.ts";

const BANNED = new Set(["#3b82f6", "#2563eb", "#f97316"]);

describe("family table", () => {
  it("lists the nine siblings beside forge, never forge itself", () => {
    assert.deepEqual(FAMILY_SLUGS, [
      "devthink",
      "cadria",
      "stealthhead",
      "debonair",
      "argan",
      "saddle",
      "foundry",
      "vault",
      "getry",
    ]);
    assert.ok(!FAMILY_SLUGS.includes("forge"));
  });

  it("answers an accent for every listed sibling", () => {
    for (const slug of FAMILY_SLUGS) {
      const member = FAMILY_ACCENTS[slug];
      assert.ok(member, `${slug} must carry an accent`);
      assert.equal(member.slug, slug);
      assert.match(member.accent, /^#[0-9a-fA-F]{6}$/);
      assert.match(member.dotInk, /^#[0-9a-fA-F]{6}$/);
    }
    // the table holds exactly the ten deploy units — no orphan accents
    assert.deepEqual(Object.keys(FAMILY_ACCENTS).sort(), [
      "argan",
      "cadria",
      "debonair",
      "devthink",
      "forge",
      "foundry",
      "getry",
      "saddle",
      "stealthhead",
      "vault",
    ]);
  });

  it("keeps the spec §12 accents stable, verbatim", () => {
    assert.equal(FAMILY_ACCENTS.devthink.accent, "#F59E0B");
    assert.equal(FAMILY_ACCENTS.argan.accent, "#34d8a8");
    assert.equal(FAMILY_ACCENTS.cadria.accent, "#f472b6");
    assert.equal(FAMILY_ACCENTS.debonair.accent, "#d9962e");
    assert.equal(FAMILY_ACCENTS.forge.accent, "#a2cb3a");
    assert.equal(FAMILY_ACCENTS.foundry.accent, "#2fb8b5");
    assert.equal(FAMILY_ACCENTS.getry.accent, "#8b5cf6");
    assert.equal(FAMILY_ACCENTS.saddle.accent, "#e86f2d");
    assert.equal(FAMILY_ACCENTS.stealthhead.accent, "#e8563f");
    assert.equal(FAMILY_ACCENTS.vault.accent, "#a3d7e6");
  });

  it("keeps the spec accent-ink column stable", () => {
    assert.equal(FAMILY_ACCENTS.forge.dotInk, "#161d03");
    assert.equal(FAMILY_ACCENTS.foundry.dotInk, "#03211f");
    assert.equal(FAMILY_ACCENTS.vault.dotInk, "#072330");
  });

  it("resolves every member through the familyurl contract", () => {
    for (const slug of FAMILY_SLUGS) {
      assert.equal(familyurl(slug), `../${slug}/`);
    }
  });

  it("never ships a banned hue in the row or the table", () => {
    for (const member of [...familyrow(), ...Object.values(FAMILY_ACCENTS)]) {
      assert.ok(!BANNED.has(member.accent.toLowerCase()), `${member.slug} rides a banned accent`);
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

  it("answers familyAccentOf for the house and falls back for unknowns", () => {
    assert.equal(familyAccentOf("forge")?.accent, "#a2cb3a");
    assert.equal(familyAccentOf("vault")?.accent, "#a3d7e6");
    assert.equal(familyAccentOf("nope"), undefined);
  });

  it("keeps the familyurl contract on the climb-one-level shape", () => {
    assert.equal(familyurl("cadria"), "../cadria/");
    assert.equal(familyurl("/cadria/"), "../cadria/");
    assert.equal(familyurl("cadria"), familyurl("  cadria ".trim()));
  });
});
