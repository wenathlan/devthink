/**
 * renderparity.test.ts — the two-door geometry law of the family renders
 * (the PR12 contract, campaign wave 3-a). The owner order: when the person
 * types DevThink barra <app> the app answers standalone — fullscreen, no
 * window, the design complete; when the person double clicks the icon
 * inside the panel the same app opens inside the system window without
 * redirecting — and BOTH faces must render the same design. The cut-window
 * complaint (the panel face arrives clipped while the typed url arrives
 * complete) dies on three geometry laws this battery pins:
 *
 * - the seat law: every family shell detects the os power clip through the
 *   frame truth (window.self against window.top) and mounts the very same
 *   surface tree under the shell--embedded / shell--standalone seat — the
 *   seat class only marks the mount, the tree never changes between the
 *   doors (one design in both seats);
 * - the height law: both seat rules answer the same viewport token (100vh
 *   / 100dvh — never a fixed desktop pixel literal), so the app always
 *   measures the door it actually rides: the browser viewport at the typed
 *   url, the iframe viewport inside the window;
 * - the scroll law: the shell clips its own overflow (the window
 *   aesthetic) only when a content stage inside it scrolls — a stage with
 *   overflow auto, or the shell letting the document scroll — so content
 *   taller than the door NEVER cuts: it answers the honest fold;
 * - the host law: the os window body is a size container (the grid row
 *   minmax(0, 1fr), the host at height 100% with container-type
 *   inline-size, the app roots at height 100%) so the windowed kits
 *   reflow against the window band, never the browser behind it;
 * - the source law: both doors ask the same document — FamilyStage mounts
 *   the family url fixed to the viewport, FamilyFrame mounts the same url
 *   plus the opt-in clip flag at 100% x 100% of the window body — one
 *   document, two doors, the parity the owner demanded.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FAMILY_SLUGS } from "../window.ts";

/** the repository root of the monorepo (the sibling apps live beside the
 * os folder and the tests village sits two honest hops above them) */
const reporoot = join(import.meta.dirname, "..", "..");

/** true when the sibling app trees live beside the os — false inside the
 * standalone container context, where the sibling geometry gates skip the
 * same checkout-only way the routing battery skips on absent trees */
const siblingspresent = existsSync(join(reporoot, "argan"));

/** the os side sources the host law reads */
const familyframe = readFileSync(join(import.meta.dirname, "..", "sol", "wingets", "ShellFamilyframe.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "sol", "sol.css"), "utf8");
const windowframe = readFileSync(join(import.meta.dirname, "..", "sol", "wingets", "PanelWindowframe.tsx"), "utf8");

/** collects every css file of one sibling theme (the geometry scan) */
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

/** reads the shell source of one slug (the seat mount) */
function shellSource(slug: string): string | null {
  const shellpath = join(reporoot, slug, "sol", "shell", "Shell.tsx");
  if (existsSync(shellpath)) return readFileSync(shellpath, "utf8");
  /* the one-component surface law (the stealthhead PR19 seat): when the
   * theme retires its shell for the single under-construction face, the
   * face the anchor mounts IS the shell seat — the battery reads it
   * there and the family contract stays absolute, no exemption rides. */
  const facepath = join(reporoot, slug, "sol", "wingets", "Constructionface.tsx");
  return existsSync(facepath) ? readFileSync(facepath, "utf8") : null;
}

/** reads the surface law sources of one slug (the app entry beside the
 * theme anchor — the construction face mounts in the anchor) */
function surfacesource(slug: string): string {
  const parts = [join(reporoot, slug, "App.tsx"), join(reporoot, slug, "sol", "Sol.tsx")];
  return parts
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

/** the under-construction seat the owner's PR19 law names: a slug whose
 * shell retired whole and whose surface answers the one-component
 * construction face walks the construction law instead of the frame
 * truth — the window chrome has no seat to mount (stealthhead's own
 * design battery pins the construction law on its side). */
function isconstructionslug(slug: string): boolean {
  return shellSource(slug) === null && /constructionface|under-construction/i.test(surfacesource(slug));
}

/** pulls one rule block out of a sheet (the seat geometry read) */
function ruleBlock(css: string, selector: string): string {
  const marker = `${selector} {`;
  const start = css.indexOf(marker);
  if (start === -1) return "";
  const end = css.indexOf("}", start);
  return end === -1 ? "" : css.slice(start, end);
}

describe("the seat law (the frame truth mounts the same tree)", () => {
  it("every family shell detects the power clip through the frame truth", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
      if (isconstructionslug(slug)) {
        // the construction law answers the slug: the one-component face
        // mounts where the shell retired (the PR19 under-construction seat)
        expect(surfacesource(slug), `${slug} answers the under-construction surface law`).toMatch(
          /constructionface|under-construction/i,
        );
        continue;
      }
      const source = shellSource(slug);
      expect(source, `${slug} carries the shell seat mount`).not.toBeNull();
      expect(source!, `${slug} answers the frame truth`).toContain("window.self !== window.top");
    }
  });

  it("both seats answer the same seat expression — one design, two doors", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
      if (isconstructionslug(slug)) continue; // no shell, no seat ternary —
      // the construction face carries the slug (the seat law above pins it)
      const source = shellSource(slug);
      expect(source, `${slug} carries the shell seat mount`).not.toBeNull();
      // the seat ternary answers the mount (the quoting follows the file's
      // own style — both dialects mount the same two seats)
      const seatdouble = source!.includes('framed ? "shell--embedded" : "shell--standalone"');
      const seatsingle = source!.includes("framed ? 'shell--embedded' : 'shell--standalone'");
      expect(seatdouble || seatsingle, `${slug} mounts the embedded seat beside the standalone seat`).toBe(true);
    }
  });
});

describe("the height law (both doors measure the door they ride)", () => {
  it("every seat rule answers the viewport token — never a fixed pixel literal", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
      if (isconstructionslug(slug)) continue; // no shell, no seat blocks —
      // the construction face carries the slug (the seat law above pins it)
      const css = themeCss(slug);
      const embedded = ruleBlock(css, ".shell--embedded");
      const standalone = ruleBlock(css, ".shell--standalone");
      expect(embedded, `${slug} styles the embedded seat`).not.toBe("");
      expect(standalone, `${slug} styles the standalone seat`).not.toBe("");
      // the viewport token: 100vh or 100dvh — the honest measure of the
      // door the app rides (the browser viewport typed, the iframe window)
      const embheight = /height:\s*100(d)?vh/.test(embedded);
      const stdheight = /height:\s*100(d)?vh/.test(standalone);
      expect(embheight, `${slug} embedded seat rides the viewport token`).toBe(true);
      expect(stdheight, `${slug} standalone seat rides the viewport token`).toBe(true);
      // the parity itself: both seats answer the SAME token
      expect(embheight).toBe(stdheight);
      // the anti-truncation half: no fixed desktop pixel literal rides the
      // seat blocks (a 1080px or 800px height would cut every shorter door)
      expect(embedded, `${slug} embedded seat carries no fixed pixel height`).not.toMatch(/height:\s*\d+px/);
      expect(standalone, `${slug} standalone seat carries no fixed pixel height`).not.toMatch(/height:\s*\d+px/);
    }
  });
});

describe("the scroll law (taller content answers the fold, never the cut)", () => {
  it("a shell that clips its overflow rides a stage that scrolls", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
      const css = themeCss(slug);
      const embedded = ruleBlock(css, ".shell--embedded");
      const clips = /overflow:\s*hidden/.test(embedded);
      if (!clips) continue; // the document-scroll door: the shell lets the
      // page scroll at the document level — an honest fold too
      // the clipped door needs an inner scroller: any overflow auto rule
      // the theme carries (the stage / content lane family)
      const scrollsrules = /overflow(-y)?:\s*auto/.test(css);
      expect(scrollsrules, `${slug} clips the shell and answers a scrolling stage`).toBe(true);
    }
  });

  it("the window body mounts the size container law", () => {
    // the grid row the app stage owns never collapses: minmax(0, 1fr)
    expect(solcss).toContain("grid-template-rows: auto auto minmax(0, 1fr) auto auto");
    // the host fills the row and answers a container so the windowed kits
    // reflow against the window band, never the browser behind it
    expect(solcss).toContain(".shell-window__host");
    const hostblock = ruleBlock(solcss, ".shell-window__host");
    expect(hostblock).toContain("height: 100%");
    expect(solcss).toContain("container-type: inline-size");
    // the app roots that answer the whole viewport on the pages answer the
    // window body inside the os
    expect(solcss).toContain(".shell-window__host .dtw-app");
    expect(solcss).toContain(".shell-window__host .dtfx-app");
  });
});

describe("the source law (both doors ask the same document)", () => {
  it("FamilyStage mounts the family url fixed to the viewport — door A", () => {
    expect(familyframe).toContain("export function FamilyStage");
    expect(familyframe).toContain("src={familyurl(slug)}");
    expect(familyframe).toContain('position: "fixed"');
    expect(familyframe).toContain("inset: 0");
    expect(familyframe).toContain('width: "100%"');
    expect(familyframe).toContain('height: "100%"');
  });

  it("FamilyFrame mounts the same url at the window band with the clip flag — door B", () => {
    expect(familyframe).toContain("export function FamilyFrame");
    // the same familyurl source: one document, two doors
    expect(familyframe).toContain("${familyurl(slug)}?clip=1");
    expect(familyframe).toContain('width: "100%"');
    expect(familyframe).toContain('height: "100%"');
    expect(familyframe).toContain('border: "0"');
  });

  it("the clip flag is opt-in chrome knowledge — it never forks the design", () => {
    // the flag only tells the app it rides the power clip; the seat law
    // above pins the tree parity — the frame comment carries the contract
    expect(familyframe).toContain("the flag never changes the design");
  });

  it("the family band floor rides the window minimums", () => {
    // family windows spawn at the 1280x800 band so the embedded render
    // answers the desktop kit — the floor lives beside the minima
    expect(windowframe).toContain("FAMILY_BAND_WIDTH = 1280");
    expect(windowframe).toContain("FAMILY_BAND_HEIGHT = 800");
  });
});

/** the vite config source of one app root (the dedupe wall read) */
function viteConfig(slug: string): string {
  return readFileSync(join(reporoot, slug, "vite.config.ts"), "utf8");
}

describe("the single-instance law (the two-react crash of the family renders)", () => {
  it("every family vite config dedupes react, react-dom and wouter onto one instance", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
      const config = viteConfig(slug);
      // the dedupe wall: the cross-app sources (devthink/reveal.ts through
      // the thin doors, the sibling engine bridges) import react and wouter
      // from outside the app root, and a resolution answered against a
      // sibling tree mounts a second physical instance beside the app's
      // own — the dispatcher of the copy that never renders answers null,
      // the wouter context hook dies with "cannot read properties of null
      // (reading 'useContext')" and the app falls to the workbench-failure
      // face on BOTH doors (the typed url and the panel window alike — the
      // deployed crash the owner saw as "cortado, nem parece mesmo design")
      const wall = config.match(/dedupe:\s*\[([^\]]*)\]/);
      expect(wall, `${slug} carries the dedupe wall`).not.toBeNull();
      const entries = wall![1];
      for (const specifier of ["react", "react-dom", "wouter"]) {
        expect(entries, `${slug} dedupes ${specifier} onto one instance`).toContain(`"${specifier}"`);
      }
    }
  });

  it("the os config carries the same wall — one react, one router, one design", () => {
    const config = viteConfig("devthink");
    const wall = config.match(/dedupe:\s*\[([^\]]*)\]/);
    expect(wall, "the os config carries the family dev bridge dedupe wall").not.toBeNull();
    const entries = wall![1];
    for (const specifier of ["react", "react-dom", "wouter"]) {
      expect(entries, `the os wall dedupes ${specifier}`).toContain(`"${specifier}"`);
    }
  });

  it("the reveal door the family re-exports imports react and wouter — the cross-app source the wall answers", () => {
    if (!siblingspresent) return;
    const reveal = readFileSync(join(reporoot, "devthink", "reveal.ts"), "utf8");
    expect(reveal, "the reveal door rides react").toContain('from "react"');
    expect(reveal, "the reveal door rides the wouter router").toContain('from "wouter"');
    // the thin door law: the family apps re-export the owner module instead
    // of carrying a duplicate (the dedup law the wall protects)
    const cadriadoor = readFileSync(join(reporoot, "cadria", "reveal.ts"), "utf8");
    expect(cadriadoor, "the cadria thin door re-exports the owner module").toContain('from "../devthink/reveal.ts"');
  });
});
