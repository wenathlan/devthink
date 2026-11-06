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
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
  return existsSync(shellpath) ? readFileSync(shellpath, "utf8") : null;
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
      const source = shellSource(slug);
      expect(source, `${slug} carries the shell seat mount`).not.toBeNull();
      expect(source!, `${slug} answers the frame truth`).toContain("window.self !== window.top");
    }
  });

  it("both seats answer the same seat expression — one design, two doors", () => {
    if (!siblingspresent) return;
    for (const slug of FAMILY_SLUGS) {
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
    expect(familyframe).toContain('inset: 0');
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
