/**
 * deploy.base.test.ts — the deployment base derivation of the running
 * application (root layer).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { derivebase, familyurl } from "../deploy.base.ts";

describe("the deployment base derivation", () => {
  it("derives the repository mount from a project pages path", () => {
    assert.equal(derivebase("/devthink/"), "/devthink");
    assert.equal(derivebase("/devthink/index.html"), "/devthink");
  });

  it("answers an empty base at the domain root", () => {
    assert.equal(derivebase("/"), "");
    assert.equal(derivebase("/index.html"), "");
    assert.equal(derivebase(""), "");
  });

  it("cuts a restored workspace route out of the base", () => {
    assert.equal(derivebase("/devthink/w/l_ab/s/l_cd/t/l_ef/chat"), "/devthink");
    assert.equal(derivebase("/w/l_ab/chat"), "");
  });

  it("resolves family units against the derived base", () => {
    assert.equal(familyurl("forge"), "/forge");
  });

  it("keeps the family slug clean", () => {
    assert.equal(familyurl("/stealhead/"), "/stealhead");
    assert.equal(familyurl("saddle"), "/saddle");
  });
});
