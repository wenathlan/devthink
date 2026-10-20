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

  it("resolves family units through the relative sibling contract", () => {
    expect(familyurl("forge")).toBe("../forge/");
  });

  it("keeps the family slug clean", () => {
    expect(familyurl("/stealthhead/")).toBe("../stealthhead/");
    expect(familyurl("saddle")).toBe("../saddle/");
  });

  it("answers the same sibling url from any boot segment (the family-route wall)", () => {
    /* the regression of the power clip iframe: the absolute form froze the
     * boot base at the family arrival segment and asked for
     * "/saddle/saddle/" — a url that answers nothing. The relative form
     * names the sibling by position, so a boot at /saddle, at /panel or at
     * the site root all carry the same answer. */
    const url = new URL(familyurl("saddle"), "http://localhost:3000/saddle");
    expect(url.pathname).toBe("/saddle/");
    const fromPanel = new URL(familyurl("saddle"), "http://localhost:3000/panel");
    expect(fromPanel.pathname).toBe("/saddle/");
    const fromRoot = new URL(familyurl("saddle"), "http://localhost:3000/");
    expect(fromRoot.pathname).toBe("/saddle/");
    const fromMount = new URL(familyurl("cadria"), "http://localhost:3000/devthink/panel");
    expect(fromMount.pathname).toBe("/cadria/");
  });
});
