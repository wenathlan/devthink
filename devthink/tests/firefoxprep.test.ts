import { describe, expect, it } from "vitest";
import {
  firefoxdenylist,
  firefoxpermissionmap,
  firefoxprepoverlay,
  firefoxprepadapt,
  firefoxprepsplitbundle,
  firefoxprepdenylistcheck,
  firefoxactionmap,
} from "../crossbrowser.js";
import type { browsermanifestsource, browsermanifestoverlay } from "../types.js";

const sourcesmanifest: browsermanifestsource = {
  manifest_version: 3,
  name: "Devthink",
  version: "1.1.86",
  description: "test",
  permissions: ["activeTab", "storage", "scripting", "sidePanel"],
  optional_permissions: ["tabs", "downloads", "clipboardRead", "clipboardWrite", "offscreen", "nativeMessaging"],
  optional_host_permissions: ["https://*/*"],
  background: { service_worker: "background.js", type: "module" },
  action: { default_popup: "popup.html" },
  side_panel: { default_path: "sidepanel.html" },
  options_ui: { page: "optionspage.html", open_in_tab: true },
  offscreen: { document: "offscreen.html", reasons: ["DOM_PARSER", "WORKERS"], justification: "test" },
};

describe("firefoxprep", () => {
  it("writes the browser specific settings with the generated extension id", () => {
    const overlay = firefoxprepoverlay({
      extensionid: "devthink@wenathlan",
      strictminversion: "115.0",
      backgroundscript: "background.js",
    });
    expect(overlay.browser_specific_settings?.id).toBe("devthink@wenathlan");
    expect(overlay.browser_specific_settings?.strict_min_version).toBe("115.0");
  });

  it("maps action keys to the firefox equivalents", () => {
    expect(firefoxactionmap()).toEqual({
      default_popup: "default_popup",
      default_title: "default_title",
      default_icon: "default_icon",
    });
  });

  it("moves the service worker to an event page for firefox", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    expect(overlay.background?.scripts).toEqual(["background.js"]);
    expect(overlay.background?.service_worker).toBeUndefined();
    const split = firefoxprepsplitbundle({ backgroundscript: "background.js" });
    expect(split.scripts).toEqual(["background.js"]);
    expect(split.serviceworkerdropped).toBe(true);
  });

  it("rewrites optional permission names where they differ", () => {
    const map = firefoxpermissionmap();
    expect(map.offscreen).toBe("");
    expect(map.tabs).toBe("tabs");
    expect(map.nativeMessaging).toBe("nativeMessaging");
  });

  it("keeps host permissions empty on every browser", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    expect(overlay.host_permissions).toEqual([]);
    const adapted = firefoxprepadapt({ manifest: sourcesmanifest, overlay, backgroundscripts: ["background.js"] });
    expect(adapted.manifest.host_permissions).toEqual([]);
  });

  it("splits the background bundle for event page semantics", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    expect(overlay.background?.scripts).toEqual(["background.js"]);
  });

  it("keeps the deny list in force across overlays", () => {
    const check = firefoxprepdenylistcheck({ manifest: sourcesmanifest });
    expect(check.ok).toBe(true);
    expect(check.refused).toEqual([]);
    const refused: browsermanifestsource = { ...sourcesmanifest, permissions: ["debugger", "storage"] };
    const refusedcheck = firefoxprepdenylistcheck({ manifest: refused });
    expect(refusedcheck.ok).toBe(false);
    expect(refusedcheck.refused).toEqual(["debugger"]);
  });

  it("drops the offscreen field and the side_panel field on the firefox manifest", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const adapted = firefoxprepadapt({ manifest: sourcesmanifest, overlay, backgroundscripts: ["background.js"] });
    expect(adapted.manifest.offscreen).toBeUndefined();
    expect(adapted.manifest.side_panel).toBeUndefined();
    expect(adapted.changes.length).toBeGreaterThan(5);
  });

  it("writes the browser_specific_settings gecko block with the extension id", () => {
    const overlay = firefoxprepoverlay({
      extensionid: "devthink@wenathlan",
      strictminversion: "115.0",
      backgroundscript: "background.js",
    });
    const adapted = firefoxprepadapt({ manifest: sourcesmanifest, overlay, backgroundscripts: ["background.js"] });
    expect(adapted.manifest.browser_specific_settings?.gecko?.id).toBe("devthink@wenathlan");
    expect(adapted.manifest.browser_specific_settings?.gecko?.strict_min_version).toBe("115.0");
  });

  it("refuses an overlay for the wrong browser", () => {
    const wrong: browsermanifestoverlay = { browser: "safari" };
    expect(() =>
      firefoxprepadapt({ manifest: sourcesmanifest, overlay: wrong, backgroundscripts: ["background.js"] }),
    ).toThrow();
  });

  it("refuses a manifest with required host permissions", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const withHosts: browsermanifestsource = { ...sourcesmanifest, host_permissions: ["https://example.com/*"] };
    expect(() => firefoxprepadapt({ manifest: withHosts, overlay, backgroundscripts: ["background.js"] })).toThrow();
  });

  it("removes the offscreen optional permission for firefox", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const adapted = firefoxprepadapt({ manifest: sourcesmanifest, overlay, backgroundscripts: ["background.js"] });
    expect(adapted.manifest.optional_permissions).not.toContain("offscreen");
    expect(adapted.manifest.optional_permissions).toContain("tabs");
    expect(adapted.manifest.optional_permissions).toContain("nativeMessaging");
  });

  it("declares the firefox deny list of forbidden permissions", () => {
    expect(firefoxdenylist).toContain("debugger");
    expect(firefoxdenylist).toContain("cookies");
    expect(firefoxdenylist).toContain("webRequest");
    expect(firefoxdenylist).toContain("history");
    expect(firefoxdenylist).toContain("bookmarks");
    expect(firefoxdenylist).toContain("proxy");
    expect(firefoxdenylist).toContain("management");
  });
});
