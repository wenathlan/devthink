/**
 * appicons.test.ts — the icon law contract of the desktop set (campaign
 * wave 5). The charged defects this battery pins closed: "the icons emoji
 * like and inconsistent" — every registry binding resolves to a drawn
 * asset of the premium set, the drawn marks carry the three indexed layers
 * (bg gradient plate, ring contour, glyph) of the animated grammar and no
 * emoji codepoint survives anywhere in the set, the labels or the folder
 * icons — and "the stealthhear label typo" — the catalog names are the
 * reviewed rows pinned verbatim (stealthhead answers stealthhead, providers
 * answers providers) and the desktop label rides the --shadow-label
 * legibility token, so the misread the live audit caught at the 12px cell
 * (the triple-blur halo dissolving the final letters) cannot return. The
 * logo law rides here too: the os tile wears exactly the two canonical
 * paths of the logo file, and the css ladder of sol.css keeps the tilt,
 * the sheen, the ring brighten, the press seat and the reduced-motion
 * guards the live tile answers.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DESKTOP_APPS } from "../devthink/appregistry.ts";
import type { ShellFolderId } from "../devthink/fileexplorer.ts";
import { DriveIcon, PlatformMark, ShellFolderIcon } from "../devthink/Sol/widgets/FilesFoldericons.tsx";
import { SolLogoMark } from "../devthink/Sol/widgets/PanelLogo.tsx";
import { APP_ICONS } from "../devthink/Sol/widgets/ShellAppicons.tsx";

/** the emoji pictograph class — one emoji glyph anywhere in a rendered icon
 * or a catalog label fails the zero-emoji law */
const EMOJI = /\p{Extended_Pictographic}/u;

/** the squircle plate face every drawn icon paints — the ~23% corner
 * radius of the 48x48 studio-light grammar (the fluent shoulder of the
 * icon redesign wave, concentric with the rounded tile — the geometry pin) */
const PLATE_FACE = "M11 0 H37 Q48 0 48 11 V37 Q48 48 37 48 H11 Q0 48 0 37 V11 Q0 0 11 0 Z";

/** the contour the ring layer traces — the machined chamfer at the
 * squircle inset, concentric with the plate corner (11 − 1.6) */
const RING_FACE = "M11 1.6 H37 Q46.4 1.6 46.4 11 V37 Q46.4 46.4 37 46.4 H11 Q1.6 46.4 1.6 37 V11 Q1.6 1.6 11 1.6 Z";

/** the reviewed label rows of the catalog — the exact names the desktop
 * cells print, pinned so a typo (stealthhear, prolerts, debomair) fails
 * before any surface renders */
const REVIEWED_NAMES: Record<string, string> = {
  chat: "Chat",
  files: "My Files",
  history: "History",
  projects: "Projects",
  console: "Console",
  calculator: "Calculator",
  image: "Image",
  video: "Video",
  audio: "Audio",
  games: "Games",
  gateway: "Gateway",
  providers: "Providers",
  usage: "Usage",
  docs: "Docs",
  settings: "Settings",
  argan: "Argan",
  cadria: "Cadria",
  debonair: "Debonair",
  stealthhead: "Stealthhead",
  forge: "Forge",
  foundry: "Foundry",
  vault: "Vault",
  getry: "Getry",
  saddle: "Saddle",
};

/** renders one drawn icon of the set to its static markup */
function renderIcon(key: string): string {
  const Icon = APP_ICONS[key];
  expect(Icon, `the ${key} asset must exist before it renders`).toBeTruthy();
  return renderToString(createElement(Icon));
}

describe("the drawn set answers the registry", () => {
  it("resolves every desktop app to a drawn asset — zero fallback tiles on the grid", () => {
    expect(DESKTOP_APPS.length).toBeGreaterThanOrEqual(24);
    for (const app of DESKTOP_APPS) {
      expect(app.iconset, `${app.id} declares its iconset key`).toBeTruthy();
      expect(APP_ICONS[app.iconset ?? ""], `${app.id} resolves in the drawn set`).toBeTruthy();
    }
  });

  it("carries the reviewed key set — every asset the shell surfaces reach", () => {
    expect(Object.keys(APP_ICONS).sort()).toEqual(
      [
        "calculator",
        "chat",
        "console",
        "docs",
        "explore",
        "files",
        "games",
        "gateway",
        "history",
        "image",
        "os",
        "projects",
        "providers",
        "routes",
        "settings",
        "usage",
        "argan",
        "cadria",
        "debonair",
        "forge",
        "foundry",
        "getry",
        "saddle",
        "stealthhead",
        "video",
        "audio",
        "vault",
      ].sort(),
    );
  });

  it("keeps the app ids as one lowercase word each (the naming law)", () => {
    for (const app of DESKTOP_APPS) {
      expect(app.id, `${app.id} stays one lowercase word`).toMatch(/^[a-z]+$/);
    }
  });

  it("carries the identity color on the tile — a hex tint per app, the chrome stays neutral", () => {
    for (const app of DESKTOP_APPS) {
      expect(app.tint, `${app.id} carries its identity hex`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("the three layer grammar of the drawn marks", () => {
  it("renders the bg, ring and glyph layers on every icon of the set", () => {
    for (const key of Object.keys(APP_ICONS)) {
      const html = renderIcon(key);
      expect(html, `${key} carries the bg layer`).toContain('data-layer="bg"');
      expect(html, `${key} carries the ring layer`).toContain('data-layer="ring"');
      expect(html, `${key} carries the glyph layer`).toContain('data-layer="glyph"');
    }
  });

  it("paints the squircle plate and the inset ring contour on every icon", () => {
    for (const key of Object.keys(APP_ICONS)) {
      const html = renderIcon(key);
      expect(html, `${key} paints the squircle plate face`).toContain(PLATE_FACE);
      expect(html, `${key} traces the ring contour`).toContain(RING_FACE);
    }
  });

  it("carries the animation hooks — the anim root, the sheen band and the decorative guard", () => {
    for (const key of Object.keys(APP_ICONS)) {
      const html = renderIcon(key);
      expect(html, `${key} rides the dt-appicon-anim root`).toContain("dt-appicon-anim");
      expect(html, `${key} carries the sheen band`).toContain("dtIconSheen");
      expect(html, `${key} stays decorative`).toContain('aria-hidden="true"');
      expect(html, `${key} never takes the focus`).toContain('focusable="false"');
    }
  });

  it("namespaces the gradient defs per icon — one uid per drawn mark", () => {
    for (const key of Object.keys(APP_ICONS)) {
      const html = renderIcon(key);
      expect(html, `${key} carries its dti uid namespace`).toContain(`id="dti-${key}`);
    }
  });

  it("answers the live flag with the glyph lift (the hover contract of the tile)", () => {
    const rest = renderIcon("chat");
    const Icon = APP_ICONS.chat;
    const live = renderToString(createElement(Icon, { live: true }));
    expect(rest).not.toContain('data-live="true"');
    expect(live, "the live flag reaches the svg root").toContain('data-live="true"');
    expect(live, "the glyph lifts and breathes while live").toContain("translateY(-.5px) scale(1.03)");
  });
});

describe("the logo law — the os mark equals the two paths of the logo file", () => {
  it("renders the official mark as exactly two paths", () => {
    const logo = renderToString(createElement(SolLogoMark, { size: 24 }));
    const paths = [...logo.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);
    expect(paths, "the logo file carries the two canonical paths").toHaveLength(2);
  });

  it("wears both canonical logo paths verbatim on the os tile", () => {
    const logo = renderToString(createElement(SolLogoMark, { size: 24 }));
    const paths = [...logo.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);
    const os = renderIcon("os");
    for (const path of paths) {
      expect(os, "the os tile paints the logo path unedited").toContain(`d="${path}"`);
    }
  });

  it("keeps the official paint order — the star core under the hexagon frame", () => {
    const os = renderIcon("os");
    const core = os.indexOf('id="dti-os-marktone"');
    const star = os.indexOf('fill="url(#dti-os-marktone)"');
    expect(star).toBeGreaterThan(-1);
    const afterStar = os.indexOf('fill="#ffffff"', star);
    expect(afterStar, "the frame inks over the star").toBeGreaterThan(star);
    expect(core, "the mark tone is declared before it paints").toBeLessThan(star);
  });
});

describe("the zero emoji law", () => {
  it("keeps every drawn icon free of emoji glyphs", () => {
    for (const key of Object.keys(APP_ICONS)) {
      expect(EMOJI.test(renderIcon(key)), `${key} never renders an emoji`).toBe(false);
    }
  });

  it("keeps every catalog label and detail free of emoji glyphs", () => {
    for (const app of DESKTOP_APPS) {
      expect(EMOJI.test(app.name), `${app.id} name stays drawn text`).toBe(false);
      expect(EMOJI.test(app.detail), `${app.id} detail stays drawn text`).toBe(false);
    }
  });

  it("keeps the folder icons of My Files free of emoji glyphs", () => {
    const folders: ShellFolderId[] = ["desktop", "documents", "downloads", "images", "music", "objects3d", "videos"];
    for (const folder of folders) {
      const html = renderToString(createElement(ShellFolderIcon, { folder }));
      expect(EMOJI.test(html), `the ${folder} folder tile stays drawn`).toBe(false);
      expect(html, `the ${folder} folder tile carries the drawn class`).toContain("dtfx-tile");
    }
    const drive = renderToString(createElement(DriveIcon, { share: 62, mounted: true }));
    expect(EMOJI.test(drive), "the drive tile stays drawn").toBe(false);
    for (const id of ["gdrive", "dropbox", "onedrive", "box", "s3", "host"] as const) {
      const mark = renderToString(createElement(PlatformMark, { id }));
      expect(EMOJI.test(mark), `the ${id} platform mark stays drawn`).toBe(false);
    }
  });
});

describe("the label catalog law — the reviewed names, pinned", () => {
  it("answers every app with its reviewed name — the typo cannot land", () => {
    for (const app of DESKTOP_APPS) {
      expect(app.name, `${app.id} prints its reviewed name`).toBe(REVIEWED_NAMES[app.id]);
    }
  });

  it("covers the whole registry with the reviewed table", () => {
    const ids = DESKTOP_APPS.map((app) => app.id).sort();
    expect(ids).toEqual(Object.keys(REVIEWED_NAMES).sort());
  });

  it("never prints the typo forms the live audit caught", () => {
    const banned = ["stealthhear", "Stealthhear", "prolerts", "Prolerts", "debomair", "Debomair"];
    for (const app of DESKTOP_APPS) {
      for (const form of banned) {
        expect(app.name).not.toBe(form);
      }
    }
  });
});

describe("the css ladder of the animated grammar", () => {
  const css = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");

  it("carries the live tilt of the drawn set on the three wrappers", () => {
    expect(css).toContain('.dt-appicon-anim[data-live="true"]');
    expect(css).toContain("rotateX(2.6deg)");
    expect(css).toContain(".dsk-cell:focus-visible .dt-appicon-anim");
    expect(css).toContain(".dt-start__app:focus-visible .dt-appicon-anim");
    expect(css).toContain(".dt-nav__app:focus-visible .dt-appicon-anim");
  });

  it("carries the perspective bed and the glint band of the premium tile", () => {
    expect(css).toContain('.dt-tile[data-tile="set"]');
    expect(css).toContain("perspective: 320px");
    expect(css).toContain('.dt-tile[data-tile="set"]::after');
    expect(css).toContain('.dt-tile[data-tile="set"][data-live="true"]::after');
  });

  it("keys the layer moves — the hue walk, the bg breath, the sheen sweep and the ring brighten", () => {
    expect(css).toContain("@keyframes dtAppiconHue");
    expect(css).toContain("@keyframes dtAppiconDrift");
    expect(css).toContain('.dt-appicon-anim [data-layer="bg"]');
    expect(css).toContain("@keyframes dtIconSheen");
    expect(css).toContain('.dt-appicon-anim[data-live="true"] [data-layer="ring"]');
  });

  it("seats the press and guards the reduced-motion and reduced-transparency laws", () => {
    expect(css).toContain(":is(button, a):active .dt-appicon-anim");
    expect(css).toContain('[data-motion="reduced"] .dt-appicon-anim');
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media (prefers-reduced-transparency: reduce)");
  });

  it("declares the label legibility token on both theme blocks", () => {
    const declared = css.match(/--shadow-label:/g) ?? [];
    expect(declared.length, "the dark and the light blocks both carry the token").toBe(2);
    expect(css).toContain("--shadow-label: 0 1px 2px rgb(0 0 0 / 88%), 0 0 10px rgb(0 0 0 / 55%)");
    expect(css).toContain("--shadow-label: 0 1px 2px rgb(255 255 255 / 85%), 0 0 10px rgb(255 255 255 / 70%)");
  });
});

describe("the desktop label rides the legibility token", () => {
  const desktop = readFileSync(join(import.meta.dirname, "..", "Sol", "widgets", "PanelDesktop.tsx"), "utf8");

  it("answers the label shadow from the token ladder, never a raw halo", () => {
    expect(desktop).toContain("dt-appicon__label");
    expect(desktop).toContain("[text-shadow:var(--shadow-label)]");
    expect(desktop, "the triple-blur halo arbitrary dies").not.toContain("0_0_3px_rgb");
  });
});

describe("the tile contract of the shared apptile", () => {
  const tile = readFileSync(join(import.meta.dirname, "..", "Sol", "widgets", "ShellApptile.tsx"), "utf8");

  it("raises the live flag from the pointer and drops it on leave", () => {
    expect(tile).toContain("setLive(true)");
    expect(tile).toContain("setLive(false)");
    expect(tile).toContain("data-live={liveFlag}");
  });

  it("never goes live under a touch pointer (a tap cannot leave an icon mid-story)", () => {
    expect(tile).toContain("(hover: none)");
  });

  it("falls back to the fluent glyph or the official mark — never a blank, never an emoji", () => {
    expect(tile).toContain("SolLogoMark");
    expect(tile).toContain("data-tile");
  });
});
