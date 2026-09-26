import { describe, expect, it } from "vitest";
import {
  apimapentries,
  apimapentryof,
  apimapkinds,
  apimapresolve,
  apimapunmapped,
  apimapbrowserof,
  apimapbrowsercacheprobe,
  apifeatureflagintersection,
  apimapstructerrorof,
} from "../crossbrowser.js";

describe("apimap catalog", () => {
  it("records every webextension api the codebase touches with a chromium and firefox mapping", () => {
    const entries = apimapentries();
    expect(entries.length).toBeGreaterThan(20);
    for (const entry of entries) {
      expect(entry.chromium).not.toBe("");
      expect(entry.firefox).not.toBe("");
      expect(entry.api).not.toBe("");
    }
  });

  it("resolves the right call through the runtime browser probe", () => {
    const chromium = apimapresolve({ api: "runtime.geturl", runtime: { chrome: { runtime: { id: "abc" } } } });
    expect(chromium.ok).toBe(true);
    expect(chromium.browser).toBe("chromium");
    expect(chromium.equivalent).toBe("chrome.runtime.getURL");
    const firefox = apimapresolve({ api: "runtime.geturl", runtime: { browser: { runtime: { id: "abc" } } } });
    expect(firefox.ok).toBe(true);
    expect(firefox.browser).toBe("firefox");
    expect(firefox.equivalent).toBe("browser.runtime.getURL");
  });

  it("reports unmapped apis at build time and fails the build when a new api lacks a row", () => {
    const report = apimapunmapped();
    expect(report.failed).toBe(false);
    expect(report.missingchromium.length).toBe(0);
    expect(report.missingfirefox.length).toBe(0);
    const partial = apimapunmapped([
      ...apimapentries(),
      { api: "fictional.api", chromium: "", firefox: "", safari: "", kind: "method" },
    ]);
    expect(partial.failed).toBe(true);
    expect(partial.missingchromium).toContain("fictional.api");
    expect(partial.missingfirefox).toContain("fictional.api");
  });

  it("looks up one apimap entry by its reviewed api name", () => {
    const entry = apimapentryof("runtime.geturl");
    expect(entry?.api).toBe("runtime.geturl");
    expect(apimapentryof("nonexistent.api")).toBeUndefined();
  });

  it("declares the four kind categories", () => {
    const kinds = apimapkinds();
    expect(kinds).toEqual(["namespace", "method", "event", "property"]);
  });

  it("caches the detected browser in memory across calls", () => {
    const probe = apimapbrowsercacheprobe({ runtime: { chrome: { runtime: { id: "abc" } } } });
    expect(probe.probe()).toBe("chromium");
    expect(probe.probe()).toBe("chromium");
    const refreshed = probe.refresh();
    expect(refreshed).toBe("chromium");
  });

  it("surfaces unmapped apis as structured errors with the retry hint none", () => {
    const resolution = apimapresolve({ api: "runtime.geturl", browser: "safari" });
    expect(resolution.ok).toBe(true);
    const struct = apimapstructerrorof({ api: "fictional.api", browser: "safari", reason: "no mapping", now: 1000 });
    expect(struct.family).toBe("apimap");
    expect(struct.retry).toBe("none");
    expect(struct.browser).toBe("safari");
    expect(struct.api).toBe("fictional.api");
    expect(struct.at).toBe(1000);
  });

  it("defaults the feature flag set to the intersection across chromium, firefox and safari", () => {
    const intersection = apifeatureflagintersection();
    expect(intersection).toContain("runtime.geturl");
    expect(intersection).toContain("tabs.query");
    expect(intersection).toContain("scripting.executeScript");
  });

  it("resolves the sidepanel api to the polyfill fallback on firefox", () => {
    const firefox = apimapresolve({ api: "sidePanel.open", browser: "firefox" });
    expect(firefox.ok).toBe(true);
    expect(firefox.equivalent).toBe("browserpolyfill.sidepanel.open");
    const safari = apimapresolve({ api: "offscreen.createDocument", browser: "safari" });
    expect(safari.ok).toBe(true);
    expect(safari.equivalent).toBe("browserpolyfill.offscreen.inline");
  });

  it("probes the running browser from the user agent when the runtime seam is absent", () => {
    expect(
      apimapbrowserof({
        probeuseragent: () => "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
      }),
    ).toBe("firefox");
    expect(
      apimapbrowserof({ probeuseragent: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15" }),
    ).toBe("safari");
    expect(
      apimapbrowserof({
        probeuseragent: () =>
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }),
    ).toBe("chromium");
  });
});
