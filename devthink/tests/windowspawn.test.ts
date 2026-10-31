// # windowspawn.test — the window registry database: the spawn geometry the
// catalog rows serve, the default fallback for the ids without a row and
// the honest number pair every windowed anchor of the os answers — beside
// the opening verdict (spawnfit): the clamp the real desktop band applies
// and the maximized answer when the family band cannot fit the screen.
import { describe, expect, it } from "vitest";
import { osAppWindows } from "../catalog.js";
import { FAMILY_SLUGS, spawnfit, WINDOW_ANCHORS, windowspawn } from "../window.js";

describe("the os app window table", () => {
  it("serves the reviewed spawn rows by app id", () => {
    const rows = osAppWindows();
    expect(rows.calculator).toEqual({ app: "calculator", width: 520, height: 660 });
    expect(rows.chat).toEqual({ app: "chat", width: 1040, height: 720 });
    expect(rows.docs).toEqual({ app: "docs", width: 980, height: 680 });
    expect(rows.console).toEqual({ app: "console", width: 980, height: 680 });
    expect(rows.settings).toEqual({ app: "settings", width: 960, height: 680 });
    expect(rows.video).toEqual({ app: "video", width: 960, height: 680 });
    expect(rows.gateway).toEqual({ app: "gateway", width: 980, height: 680 });
  });

  it("serves the family deploy units at the 1280x800 desktop band — the window answers the standalone design", () => {
    // the window-era law: the app inside the power clip answers the SAME
    // design the direct url answers, so the family windows open at the
    // 1280x800 band where the 961px+ breakpoints of the standalone tree
    // fire inside the frame (only the screen space may clamp it at spawn)
    const rows = osAppWindows();
    for (const slug of FAMILY_SLUGS) {
      expect(rows[slug], `${slug} carries the family spawn row`).toEqual({
        app: slug,
        width: 1280,
        height: 800,
      });
    }
  });

  it("carries only the windowed apps of the os — the anchors and the family deploy units", () => {
    const rows = osAppWindows();
    for (const app of Object.keys(rows)) {
      expect([...WINDOW_ANCHORS, ...FAMILY_SLUGS], `${app} must be a windowed app of the os`).toContain(app);
    }
  });
});

describe("windowspawn", () => {
  it("answers the catalog geometry for the seeded apps", () => {
    expect(windowspawn("chat")).toEqual({ width: 1040, height: 720 });
    expect(windowspawn("calculator")).toEqual({ width: 520, height: 660 });
  });

  it("answers the 1280x800 default for an unknown id — the desktop band of the os", () => {
    expect(windowspawn("not-an-app")).toEqual({ width: 1280, height: 800 });
  });

  it("answers the 1280x800 family geometry for every family deploy unit", () => {
    for (const slug of FAMILY_SLUGS) {
      expect(windowspawn(slug), `${slug} opens at the desktop band`).toEqual({ width: 1280, height: 800 });
    }
  });

  it("answers a finite number pair for every windowed anchor of the os", () => {
    for (const id of WINDOW_ANCHORS) {
      const spawn = windowspawn(id);
      expect(typeof spawn.width, `${id} width must be a number`).toBe("number");
      expect(typeof spawn.height, `${id} height must be a number`).toBe("number");
      expect(Number.isFinite(spawn.width), `${id} width must be finite`).toBe(true);
      expect(Number.isFinite(spawn.height), `${id} height must be finite`).toBe(true);
    }
  });

  it("answers every seeded row exactly — the database geometry wins over the default", () => {
    for (const row of Object.values(osAppWindows())) {
      expect(windowspawn(row.app)).toEqual({ width: row.width, height: row.height });
    }
  });
});

describe("spawnfit — the opening verdict against the screen", () => {
  it("keeps the family band floating while the screen carries it whole", () => {
    // 1920x1080: the desktop band (1080 minus the 48px taskbar) carries
    // the 1280x800 band with the gutter and the breathing — the window
    // opens floating at its catalog geometry, the 961px+ breakpoints of
    // the standalone tree fire inside the frame
    const fit = spawnfit("saddle", { width: 1920, height: 1080 });
    expect(fit.maximized).toBe(false);
    expect(fit.width).toBe(1280);
    expect(fit.height).toBe(800);
    expect(fit.desktopWidth).toBe(1920);
    expect(fit.desktopHeight).toBe(1032);
  });

  it("opens the family window already maximized when the band does not fit — the width edge", () => {
    // a 1280 viewport cannot carry the 1280 band plus the 16px gutter:
    // the floating answer would squeeze the standalone design below its
    // breakpoint, the full snap answers the viewport the direct url
    // answers (the cut-window bug of PR12)
    expect(spawnfit("saddle", { width: 1280, height: 1080 }).maximized).toBe(true);
  });

  it("opens the family window already maximized when the band does not fit — the height edge", () => {
    // the 720px laptop: the desktop band (672) cannot carry the 800px
    // band plus the cascade offset — the old clamp opened a ~542px cut
    expect(spawnfit("saddle", { width: 1920, height: 720 }).maximized).toBe(true);
    // one pixel under the edge (879): the desktop band misses the 832
    // the 800 band asks (offset 26 + breathing 6)
    expect(spawnfit("saddle", { width: 1920, height: 879 }).maximized).toBe(true);
    // at the edge (880): the band fits and the window opens floating
    expect(spawnfit("saddle", { width: 1920, height: 880 }).maximized).toBe(false);
  });

  it("keeps a sane restore bound inside the maximized verdict", () => {
    const fit = spawnfit("saddle", { width: 1280, height: 720 });
    expect(fit.maximized).toBe(true);
    // the snapshot keeps the clamped floating bounds — the restore of the
    // maximized window lands inside the screen, never at the raw band
    expect(fit.width).toBeLessThanOrEqual(1280 - 16);
    expect(fit.height).toBeLessThanOrEqual(720 - 48 - 26);
  });

  it("never maximizes the anchors — their bodies carry the embedded contract and clamp", () => {
    // the chat window on a 720px laptop stays floating: the anchor bodies
    // answer the embedded contract, the clamp fits them to the desktop
    // band (the height answers the band, never the old 130px reservation)
    const fit = spawnfit("chat", { width: 1280, height: 720 });
    expect(fit.maximized).toBe(false);
    expect(fit.width).toBe(1040);
    expect(fit.height).toBe(646);
  });

  it("keeps the portrait law on a phone viewport", () => {
    // 390px phone: the window spawns 374px wide (the viewport minus the
    // gutter) and never under the frame floor — the portrait law the
    // desktop surface answers
    const fit = spawnfit("chat", { width: 390, height: 844 });
    expect(fit.width).toBe(374);
    expect(fit.maximized).toBe(false);
  });
});
