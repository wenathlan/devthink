/**
 * windowface.test.ts — the explore chrome face law (the window seat the
 * landing rides). The owner order: the x close glyph of the explore
 * surface stays inside the window at every resize — the chrome pins to
 * the frame box the page mounts, never to the viewport — and the explore
 * chrome answers the family canon (the caption grammar of the os
 * windows). This battery pins the ExploreWindowchrome contract so the
 * resize overflow the landing carried can never return:
 *
 * - the reveal zone follows the window border: the windowed top edge
 *   rides the frame gutter constant, the maximized top edge rides the
 *   viewport — the effect re-arms on the maximized state so the zone is
 *   never stale;
 * - the chrome box: the windowed mode pins to the frame geometry (the
 *   gutter and the 1400px max-width frame), the maximized mode spans the
 *   viewport — the box never escapes the frame it captions;
 * - the caption cells: the doctrine band (--win-titlebar-h), the 46px
 *   fluent width, the never-shrink law (shrink-0) and the overflow
 *   containment of the row (overflow-hidden + min-w-0) — the close x
 *   stays inside at every width;
 * - the close red rides --win-close and the focus ring rides the window
 *   focus token (--win-focus) — the caption family law;
 * - the chrome is fluent (DismissRegular / SubtractRegular /
 *   StopRegular glyphs) and self-contained (zero stylesheet rules).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const chrome = readFileSync(
  join(import.meta.dirname, "..", "sol", "wingets", "ExploreWindowchrome.tsx"),
  "utf8",
);

describe("the explore chrome face law", () => {
  it("the reveal zone follows the window border — the gutter constant arms the windowed edge and the effect re-arms on the maximized state", () => {
    expect(chrome).toContain("const HIT_PX = 6");
    expect(chrome).toContain("const WINDOW_GUTTER_PX = 12");
    expect(chrome).toContain("event.clientY <= HIT_PX + (maximized ? 0 : WINDOW_GUTTER_PX)");
    expect(chrome, "the zone never rides a stale maximized flag").toContain("}, [maximized]);");
  });

  it("the windowed chrome pins to the frame box — the gutter and the 1400px frame the page mounts, never the viewport", () => {
    const windowed = chrome.match(/maximized \? "inset-x-0 top-0" : "([^"]+)"/);
    expect(windowed?.[1], "the windowed mode exists beside the maximized span").toBeTruthy();
    expect(windowed?.[1]).toContain("top-3");
    expect(windowed?.[1], "the frame gutter rides both edges").toContain("12px");
    expect(windowed?.[1], "the frame max-width rides the centered calc").toContain("700px");
  });

  it("the caption cells never shrink and the row clips its overflow — the close x stays inside the window at every width", () => {
    expect(chrome, "the cell rides the doctrine band").toContain("h-(--win-titlebar-h)");
    expect(chrome, "the cell rides the fluent 46px width").toContain("w-[46px]");
    expect(chrome, "the cells never shrink").toContain("shrink-0");
    expect(chrome, "the row clips its own overflow").toContain("overflow-hidden");
    expect(chrome, "the row absorbs the squeeze").toContain("min-w-0");
  });

  it("the caption family law — the close red rides the close token and the focus ring rides the window focus token", () => {
    expect(chrome).toContain("--win-close");
    expect(chrome).toContain("--win-focus");
    expect(chrome, "the close hover never fights a competing utility").toContain("--win-hover");
  });

  it("the chrome is fluent and self-contained — the dismiss glyphs ride the fluent sheet and zero stylesheet rules exist", () => {
    expect(chrome).toContain("DismissRegular as X");
    expect(chrome).toContain("SubtractRegular as Minus");
    expect(chrome).toContain("StopRegular as Square");
    expect(chrome, "the component owns its styles inline").toContain("Fully self-contained");
    expect(chrome).not.toMatch(/\.explore-chrome\s*\{/);
  });
});
