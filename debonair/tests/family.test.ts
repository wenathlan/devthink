// # family.test — the family table the chrome rides (campaign 5-b, the
// contract D): the eight siblings beside debonair are listed once, every
// slug resolves through the familyurl contract into a climb-one-level url,
// every member carries the spec §12 accent with its own dot ink, and no
// accent ever collides with the banned palette. The rail foot, the landing
// footer and this test consume the same table — the row cannot drift.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { FAMILY_ACCENTS, FAMILY_SLUGS, familyrow } from "../family.ts";
import { familyurl } from "../familyurl.ts";

const BANNED = new Set(["#3b82f6", "#2563eb", "#f97316"]);

describe("family table", () => {
  it("lists the eight siblings beside debonair, never debonair itself", () => {
    assert.deepEqual(FAMILY_SLUGS, ["argan", "cadria", "forge", "foundry", "getry", "saddle", "stealthhead", "vault"]);
    assert.ok(!FAMILY_SLUGS.includes("debonair"));
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

  it("keeps the spec §12 accents stable", () => {
    assert.equal(FAMILY_ACCENTS.argan.accent, "#34d8a8");
    assert.equal(FAMILY_ACCENTS.cadria.accent, "#f472b6");
    assert.equal(FAMILY_ACCENTS.forge.accent, "#a2cb3a");
    assert.equal(FAMILY_ACCENTS.foundry.accent, "#2fb8b5");
    assert.equal(FAMILY_ACCENTS.getry.accent, "#8b5cf6");
    assert.equal(FAMILY_ACCENTS.saddle.accent, "#e86f2d");
    assert.equal(FAMILY_ACCENTS.stealthhead.accent, "#e8563f");
    assert.equal(FAMILY_ACCENTS.vault.accent, "#a3d7e6");
  });

  it("pairs every accent with its own spec ink", () => {
    assert.equal(FAMILY_ACCENTS.argan.dotInk, "#04231a");
    assert.equal(FAMILY_ACCENTS.cadria.dotInk, "#2a0715");
    assert.equal(FAMILY_ACCENTS.forge.dotInk, "#161d03");
    assert.equal(FAMILY_ACCENTS.foundry.dotInk, "#03211f");
    assert.equal(FAMILY_ACCENTS.getry.dotInk, "#120533");
    assert.equal(FAMILY_ACCENTS.saddle.dotInk, "#2a0f02");
    assert.equal(FAMILY_ACCENTS.stealthhead.dotInk, "#2c0703");
    assert.equal(FAMILY_ACCENTS.vault.dotInk, "#072330");
  });

  it("never ships a banned hue in the row", () => {
    for (const member of familyrow()) {
      assert.ok(!BANNED.has(member.accent), `${member.slug} rides a banned accent`);
    }
  });

  it("keeps every accent distinct — the row never repeats a hue", () => {
    const accents = familyrow().map((member) => member.accent);
    assert.equal(new Set(accents).size, accents.length);
  });

  it("builds the rail row in slug order without gaps", () => {
    const row = familyrow();
    assert.equal(row.length, FAMILY_SLUGS.length);
    assert.deepEqual(
      row.map((member) => member.slug),
      [...FAMILY_SLUGS],
    );
  });
});
