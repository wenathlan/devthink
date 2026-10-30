// # windowspawn.test — the window registry database: the spawn geometry the
// catalog rows serve, the default fallback for the ids without a row and
// the honest number pair every windowed anchor of the os answers.
import { describe, expect, it } from "vitest";
import { osAppWindows } from "../catalog.js";
import { FAMILY_SLUGS, WINDOW_ANCHORS, windowspawn } from "../window.js";

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
