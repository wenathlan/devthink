// # familyurl.test — the family link resolver of the rail foot: the relative
// sibling path the window chrome builds for the other deploy units of the
// family, runnable with the node built-in runner (no dependencies, no
// install):
//   node --test tests/familyurl.test.ts
// Every test watches the contract the rail promises: the url always climbs
// one level into the sibling folder, is slash-terminated, survives slugs
// that arrive decorated with slashes and answers for every member of the
// family.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { familyurl } from "../familyurl.ts";

describe("familyurl", () => {
  it("resolves a bare slug into the sibling folder", () => {
    assert.equal(familyurl("devthink"), "../devthink/");
    assert.equal(familyurl("stealthhead"), "../stealthhead/");
    assert.equal(familyurl("debonair"), "../debonair/");
    assert.equal(familyurl("getry"), "../getry/");
  });

  it("strips decorative slashes from the slug", () => {
    assert.equal(familyurl("/devthink"), "../devthink/");
    assert.equal(familyurl("devthink/"), "../devthink/");
    assert.equal(familyurl("/debonair/"), "../debonair/");
    assert.equal(familyurl("//forge//"), "../forge/");
  });

  it("keeps the relative form stable for every member of the family", () => {
    for (const slug of ["devthink", "stealthhead", "debonair", "argan", "saddle", "forge", "foundry", "vault", "getry"]) {
      const url = familyurl(slug);
      assert.ok(url.startsWith("../"), `${url} must climb one deploy unit`);
      assert.ok(url.endsWith("/"), `${url} must be slash-terminated`);
      assert.equal(url, `../${slug}/`);
    }
  });
});
