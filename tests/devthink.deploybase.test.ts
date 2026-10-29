/**
 * deploybase.test.ts — the deployment base derivation of the running
 * application (root layer).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { derivebase, familyurl } from "../devthink/gateway.ts";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it("resolves family units from the family root the build declares", () => {
    /* the baseless lane (the dev server and the self hosted domain roots):
     * the os lives at the site root and every member app sits one segment
     * deep — the sibling is "/<slug>/". */
    vi.stubEnv("BASE_URL", "/");
    expect(familyurl("forge")).toBe("/forge/");
    expect(familyurl("saddle")).toBe("/saddle/");
  });

  it("nests the family under the repository segment of the pages mount", () => {
    /* the pages lane: the os builds with the repository base and every
     * member app rides under the same segment — the sibling is
     * "/<repository>/<slug>/", never the site root the relative form
     * walked to. */
    vi.stubEnv("BASE_URL", "/devthink/");
    expect(familyurl("saddle")).toBe("/devthink/saddle/");
    expect(familyurl("cadria")).toBe("/devthink/cadria/");
  });

  it("keeps the family slug clean", () => {
    vi.stubEnv("BASE_URL", "/devthink/");
    expect(familyurl("/stealthhead/")).toBe("/devthink/stealthhead/");
    vi.stubEnv("BASE_URL", "/");
    expect(familyurl("saddle")).toBe("/saddle/");
  });

  it("answers the same sibling url from any route of the os (the arrival wall)", () => {
    /* the regression of the power clip iframe: the resolution never reads
     * the live route, so a family arrival at /saddle, a page at /panel and
     * the site root all ask for the same absolute url — the boot pathname
     * can never freeze the answer. The pages lane pins the same wall one
     * level deeper: the nested tree answers "/devthink/saddle/" from every
     * route, where the relative form walked out of the repository segment
     * and asked the site root for a sibling that lives under the mount. */
    vi.stubEnv("BASE_URL", "/");
    const url = new URL(familyurl("saddle"), "http://localhost:3000/saddle");
    expect(url.pathname).toBe("/saddle/");
    const fromPanel = new URL(familyurl("saddle"), "http://localhost:3000/panel");
    expect(fromPanel.pathname).toBe("/saddle/");
    const fromRoot = new URL(familyurl("saddle"), "http://localhost:3000/");
    expect(fromRoot.pathname).toBe("/saddle/");
    vi.stubEnv("BASE_URL", "/devthink/");
    const fromMount = new URL(familyurl("cadria"), "http://localhost:3000/devthink/panel");
    expect(fromMount.pathname).toBe("/devthink/cadria/");
    const fromArrival = new URL(familyurl("cadria"), "http://localhost:3000/devthink/cadria");
    expect(fromArrival.pathname).toBe("/devthink/cadria/");
  });
});
