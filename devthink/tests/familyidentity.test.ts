/**
 * familyidentity.test.ts — the identity contract of the family views
 * (campaign task 3-c). The table in Sol/os/familyaccent.ts is the single
 * source of the per-app accents (the design-spec section 12 decisions);
 * the catalog in Sol/os/apps.ts mirrors it, every view resolves its
 * identity through familyAccentOf, and the offline seed of the family
 * sites answers all eight siblings. These tests pin that contract so a
 * drift (a hex that slides back to a banned blue/orange, a missing
 * sibling in the seed, a catalog accent edited apart from the table)
 * fails before any view renders unlit.
 */
import { describe, expect, it } from "vitest";
import { APPS, appMeta } from "../Sol/os/apps";
import { FAMILY_ACCENT, familyAccentOf } from "../Sol/os/familyaccent";
import { seedFamilySites } from "../seedcatalog";

/** the spec-12 accent table, verbatim — the decided colors of the campaign. */
const SPEC_ACCENTS: Record<string, string> = {
  devthink: "#F59E0B", // âmbar-Sol
  argan: "#34d8a8", // jade
  cadria: "#f472b6", // rosa-magenta
  debonair: "#d9962e", // latão
  stealthhead: "#e8563f", // ember coral
  saddle: "#e86f2d", // ember couro
  forge: "#a2cb3a", // lime-brasa
  foundry: "#2fb8b5", // têmpera
  vault: "#a3d7e6", // gelo-de-cofre
  getry: "#8b5cf6", // violeta
};

describe("the family accent table", () => {
  it("carries exactly the spec-12 decisions, one entry per app", () => {
    expect(FAMILY_ACCENT).toEqual(SPEC_ACCENTS);
  });

  it("never carries a banned color", () => {
    const banned = ["#3b82f6", "#2563eb", "#f97316"];
    for (const [id, hex] of Object.entries(FAMILY_ACCENT)) {
      expect(banned, `${id} must not regress to a banned accent`).not.toContain(hex.toLowerCase());
    }
  });

  it("resolves every catalog app to its spec accent", () => {
    for (const app of APPS) {
      expect(familyAccentOf(app.id, "#000000")).toBe(SPEC_ACCENTS[app.id]);
    }
  });

  it("falls back to the catalog accent for an unknown id", () => {
    expect(familyAccentOf("not-an-app", "#123456")).toBe("#123456");
  });
});

describe("the os catalog", () => {
  it("mirrors the spec table on every entry — one accent, one source", () => {
    for (const app of APPS) {
      expect(app.accent, `${app.id}.accent must equal the family table`).toBe(SPEC_ACCENTS[app.id]);
    }
  });

  it("answers the app lookup for every family surface", () => {
    for (const app of APPS) {
      expect(appMeta(app.id)?.id).toBe(app.id);
    }
  });

  it("gives every surface at least three unique pages with labels (the hero/pages contract)", () => {
    for (const app of APPS) {
      expect(app.pages.length >= 3, `${app.id} needs ≥ 3 pages`).toBe(true);
      const ids = app.pages.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const p of app.pages) {
        expect(p.label.trim().length > 0).toBe(true);
      }
    }
  });

  it("serves every family surface from its own devthink.pro host (the platform on the apex)", () => {
    for (const app of APPS) {
      if (app.id === "devthink") {
        expect(app.domain).toBe("devthink.pro");
        continue;
      }
      expect(app.domain, `${app.id} domain`).toBe(`${app.slug}.devthink.pro`);
    }
  });
});

describe("the offline family seed", () => {
  it("answers all eight siblings — vault, forge, foundry and getry included", () => {
    const familyIds = APPS.filter((a) => a.id !== "devthink").map((a) => a.id);
    expect(familyIds).toHaveLength(8);
    for (const id of familyIds) {
      const site = seedFamilySites.find((s) => s.host.startsWith(`https://${id}.`));
      expect(site, `the seed must carry ${id}`).toBeDefined();
    }
  });

  it("keeps one unique https host per site, served under the family domain", () => {
    const hosts = seedFamilySites.map((s) => s.host);
    expect(new Set(hosts).size).toBe(hosts.length);
    for (const host of hosts) {
      expect(host.startsWith("https://")).toBe(true);
      expect(host.endsWith(".devthink.pro")).toBe(true);
    }
  });

  it("names each site after its own app — never a DevThink-labeled clone", () => {
    for (const site of seedFamilySites) {
      const slug = new URL(site.host).hostname.split(".")[0];
      expect(site.name.toLowerCase().startsWith(`${slug} `), `${site.host} names itself`).toBe(true);
      expect(site.blurb.trim().length > 0).toBe(true);
    }
  });
});
