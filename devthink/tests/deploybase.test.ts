/**
 * deploybase.test.ts — the deployment base derivation of the running
 * application (root layer).
 */
import { describe, expect, it } from "vitest";
import { derivebase, familyurl } from "../deploybase.ts";

describe("the deployment base derivation", () => {
  it("derives the repository mount from a project pages path", () => {
    expect(derivebase("/devthink/")).toBe("/devthink");
    expect(derivebase("/devthink/index.html")).toBe("/devthink");
  });

  it("answers an empty base at the domain root", () => {
    expect(derivebase("/")).toBe("");
    expect(derivebase("/index.html")).toBe("");
    expect(derivebase("")).toBe("");
  });

  it("cuts a restored workspace route out of the base", () => {
    expect(derivebase("/devthink/w/l_ab/s/l_cd/t/l_ef/chat")).toBe("/devthink");
    expect(derivebase("/w/l_ab/chat")).toBe("");
  });

  it("resolves family units against the derived base", () => {
    expect(familyurl("forge")).toBe("/forge");
  });

  it("keeps the family slug clean", () => {
    expect(familyurl("/stealthhead/")).toBe("/stealthhead");
    expect(familyurl("saddle")).toBe("/saddle");
  });
});
