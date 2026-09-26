import { describe, expect, it } from "vitest";
import { apimapentries, apimapunmapped } from "../crossbrowser.js";
import { firefoxprepoverlay, firefoxprepadapt } from "../crossbrowser.js";
import { xpipackassemble } from "../crossbrowser.js";
import { apimapentries as firefoxentries } from "../crossbrowser.js";

const sourcesmanifest = {
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

describe("cross browser invariants", () => {
  it("keeps the kind catalog identical on every browser", () => {
    const chromium = apimapentries();
    const firefox = firefoxentries();
    expect(chromium.length).toBe(firefox.length);
    for (let index = 0; index < chromium.length; index += 1) {
      const left = chromium[index];
      const right = firefox[index];
      expect(left?.api).toBe(right?.api);
    }
  });

  it("keeps the policy gates identical on every browser through the deny list", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const adapted = firefoxprepadapt({
      manifest: sourcesmanifest as never,
      overlay,
      backgroundscripts: ["background.js"],
    });
    const forbidden = ["debugger", "cookies", "webRequest", "history", "bookmarks", "proxy", "management"];
    for (const permission of forbidden) {
      expect(adapted.manifest.permissions).not.toContain(permission);
    }
  });

  it("keeps the observation schema byte identical across browsers", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const adapted = firefoxprepadapt({
      manifest: sourcesmanifest as never,
      overlay,
      backgroundscripts: ["background.js"],
    });
    expect(adapted.manifest.manifest_version).toBe(3);
    expect(adapted.manifest.name).toBe("Devthink");
    expect(adapted.manifest.version).toBe(sourcesmanifest.version);
    expect(adapted.manifest.description).toBe(sourcesmanifest.description);
    expect(adapted.manifest.options_ui).toEqual(sourcesmanifest.options_ui);
  });

  it("keeps the audit trail format identical across browsers", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const adapted = firefoxprepadapt({
      manifest: sourcesmanifest as never,
      overlay,
      backgroundscripts: ["background.js"],
    });
    expect(adapted.manifest.content_security_policy?.extension_pages).toContain("script-src");
    expect(adapted.manifest.content_security_policy?.extension_pages).toContain("object-src");
  });

  it("extension id per browser feeds the servercontract handshake", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const adapted = firefoxprepadapt({
      manifest: sourcesmanifest as never,
      overlay,
      backgroundscripts: ["background.js"],
    });
    expect(adapted.manifest.browser_specific_settings?.gecko?.id).toBe("devthink@wenathlan");
  });

  it("native transport stays chromium first and reports unsupported elsewhere", () => {
    const entries = apimapentries();
    const native = entries.find((entry) => entry.api === "nativeMessaging");
    expect(native).toBeDefined();
    expect(native?.chromium).toBe("chrome.runtime.connectNative");
    expect(native?.firefox).toBe("browser.runtime.connectNative");
    expect(native?.safari).toBe("");
  });

  it("version sync stamps the same version into every browser manifest", () => {
    const overlay = firefoxprepoverlay({ extensionid: "devthink@wenathlan", backgroundscript: "background.js" });
    const adapted = firefoxprepadapt({
      manifest: sourcesmanifest as never,
      overlay,
      backgroundscripts: ["background.js"],
    });
    expect(adapted.manifest.version).toBe(sourcesmanifest.version);
    const xpibuilt = xpipackassemble({
      manifest: adapted.manifest as never,
      bundleentries: [],
      version: sourcesmanifest.version,
    });
    expect(xpibuilt.archive.name).toBe(`devthink-${sourcesmanifest.version}.xpi`);
  });

  it("apimap reports every recorded api has a chromium and firefox mapping", () => {
    const report = apimapunmapped();
    expect(report.failed).toBe(false);
    for (const row of report.rows) {
      expect(row.chromium).toBe(true);
      expect(row.firefox).toBe(true);
    }
  });
});
