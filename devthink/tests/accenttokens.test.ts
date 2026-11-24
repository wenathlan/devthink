/**
 * accenttokens.test.ts — the accent law of the family themes (the PR9
 * contract, campaign wave 3-a). The owner order: the design law demands
 * two accent tokens seated across the whole eleven-app family, and neither
 * may ever ride alone. The battery pins both seats:
 *
 * - the ice-vault seat: the "gelo de cofre" accent --accent-ice-vault
 *   #a3d7e6 — the pale ice lane the vault surfaces borrow — lives in the
 *   main :root token block of every family theme (the ten siblings beside
 *   the devthink app itself), never a one-off literal;
 * - the focus seat: the WINDOWS accent #4cc2ff governs focus and the
 *   chrome in every theme — the ice-vault lane never replaces it, the two
 *   accents ride side by side (focus stays the windows blue);
 * - the flip law: the os theme pins the dark focus seat --win-focus
 *   #4cc2ff as the literal the light face (#0067c0) flips against — the
 *   seat the family focus tokens resolve through.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FAMILY_SLUGS } from "../window.ts";

/** the repository root of the monorepo (the sibling apps live beside the
 * os folder and the tests village sits two honest hops above them) */
const reporoot = join(import.meta.dirname, "..", "..");

/** true when the sibling app trees live beside the os — false inside the
 * standalone container context, where the sibling accent gates skip the
 * same checkout-only way the routing battery skips on absent trees */
const siblingspresent = existsSync(join(reporoot, "argan"));

/** the os side theme the flip law reads */
const solcss = readFileSync(join(import.meta.dirname, "..", "sol", "sol.css"), "utf8");

/** collects every css file of one sibling theme (the accent scan) */
function collectCss(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".css")) out.push(full);
    }
  };
  walk(root);
  return out;
}

/** reads the theme css of one slug (the concatenated sheet set) */
function themeCss(slug: string): string {
  return collectCss(join(reporoot, slug, "sol"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

describe("the accent law (the ice-vault lane rides the family)", () => {
  it("every sibling theme seats the ice-vault accent token", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
      const css = themeCss(slug);
      expect(css, `${slug} seats the gelo-de-cofre accent`).toContain("--accent-ice-vault: #a3d7e6;");
    }
  });

  it("every sibling theme carries the windows focus seat beside it", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
      const css = themeCss(slug);
      // focus stays the windows #4cc2ff — the ice lane never replaces it
      expect(css, `${slug} carries the windows focus seat`).toContain("#4cc2ff");
    }
  });
});

describe("the os seat (the devthink app pins both accents itself)", () => {
  it("the os theme seats the ice-vault accent beside the windows focus", () => {
    expect(solcss).toContain("--accent-ice-vault: #a3d7e6;");
    expect(solcss).toContain("#4cc2ff");
  });
});

describe("the flip law (the dark focus seat the light face flips against)", () => {
  it("the os theme pins the windows focus seat --win-focus #4cc2ff", () => {
    expect(solcss).toContain("--win-focus: #4cc2ff;");
  });
});
