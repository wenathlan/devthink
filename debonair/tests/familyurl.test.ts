// # familyurl.test — the family link resolver of the root layer: the relative
// sibling path the chrome builds for the other deploy units of the family,
// runnable with the vitest runner:
//   pnpm test
// Every test watches the contract the family promises: the url always climbs
// one level into the sibling folder, is slash-terminated, survives slugs
// that arrive decorated with slashes and answers for every member of the
// family.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { familyurl } from "../familyurl.ts";

describe("familyurl", () => {
  it("climbs one level and enters the sibling folder, slash-terminated", () => {
    assert.equal(familyurl("cadria"), "../cadria/");
  });

  it("strips decorative slashes from the slug", () => {
    assert.equal(familyurl("/cadria/"), "../cadria/");
    assert.equal(familyurl("///cadria///"), "../cadria/");
  });

  it("answers for every deploy unit of the family", () => {
    for (const slug of ["devthink", "cadria", "stealthhead", "foundry", "forge", "vault", "getry"]) {
      assert.equal(familyurl(slug), `../${slug}/`);
    }
  });

  it("keeps multi-segment slugs as the caller wrote them (minus the decoration)", () => {
    assert.equal(familyurl("family/apps"), "../family/apps/");
  });
});
