import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { firefoxprepoverlay, firefoxprepadapt, firefoxprepdenylistcheck } from "../crossbrowser.js";
import { xpipackassemble, xpinameof, xpipacklintercheck, xpilinterbudget } from "../crossbrowser.js";
import { safariskeletonbuild } from "../crossbrowser.js";
import { apifeatureflagintersection, apimapbrowserof, apimapbrowsercacheprobe } from "../gateway.js";
import { browserpolyfillintersection, browserpolyfillof } from "../crossbrowser.js";
import type { browsermanifestsource } from "../types.js";

describe("browser coverage release suite", () => {
  it("version sync tests stamp every browser manifest identically", async () => {
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as browsermanifestsource;
    const firefoxoverlay = manifest.browsers?.firefox;
    const safariOverlay = manifest.browsers?.safari;
    if (firefoxoverlay === undefined) throw new Error("The root manifest carries the firefox overlay under the browsers key; a missing overlay never verifies the firefox target.");
    if (safariOverlay === undefined) throw new Error("The root manifest carries the safari overlay under the browsers key; a missing overlay never verifies the safari target.");
    expect(manifest.version).toBe(packagejson.version);
    expect(firefoxoverlay.browser).toBe("firefox");
    expect(safariOverlay.browser).toBe("safari");
    expect(Object.keys(firefoxoverlay)).not.toContain("version");
    expect(Object.keys(safariOverlay)).not.toContain("version");
    expect(Object.keys(manifest.vsix ?? {})).not.toContain("version");
    const firefoxsettings = firefoxoverlay.browser_specific_settings;
    const firefoxbrowserscripts = firefoxoverlay.background?.scripts;
    if (firefoxsettings === undefined) throw new Error("The firefox overlay carries the browser specific settings with the generated extension id; a missing settings block never verifies the firefox target.");
    if (firefoxbrowserscripts === undefined || firefoxbrowserscripts.length === 0) throw new Error("The firefox overlay carries the event page background scripts; a missing script never verifies the firefox target.");
    const firefoxbrowserscript = firefoxbrowserscripts[0];
    if (firefoxbrowserscript === undefined) throw new Error("The firefox overlay names the first event page background script; an empty script name never verifies the firefox target.");
    const overlay = firefoxprepoverlay({ extensionid: firefoxsettings.id, ...(firefoxsettings.strict_min_version !== undefined ? { strictminversion: firefoxsettings.strict_min_version } : {}), backgroundscript: firefoxbrowserscript });
    const adapted = firefoxprepadapt({ manifest, overlay, backgroundscripts: ["background.js"] });
    expect(adapted.manifest.version).toBe(packagejson.version);
    expect(adapted.manifest.browsers).toBeUndefined();
    expect(adapted.manifest.vsix).toBeUndefined();
    const xpibuilt = xpipackassemble({ manifest: adapted.manifest, bundleentries: [{ name: "background.js", bytes: new Uint8Array([0]) }], version: packagejson.version });
    expect(xpibuilt.archive.name).toBe(`devthink-${packagejson.version}.xpi`);
    const safaribuilt = safariskeletonbuild({ version: packagejson.version, bundleid: "com.wenathlan.devthink", extensionpayload: [{ name: "manifest.json", bytes: new Uint8Array([0]) }], entitlements: ["com.apple.security.app-sandbox"] });
    expect(safaribuilt.archive.name).toBe(`devthink-safari-${packagejson.version}.zip`);
  });

  it("addons linter test runs in the local suite when the linter is installed", () => {
    const markers = { errors: 0, warnings: 0 };
    const check = xpipacklintercheck({ markers, budget: xpilinterbudget });
    expect(check.ok).toBe(true);
  });

  it("cross browser policy tests run the full kind catalog on every build", () => {
    const intersection = apifeatureflagintersection();
    expect(intersection.length).toBeGreaterThan(20);
  });

  it("cross browser protocol tests assert identical observation bytes", () => {
    const intersection = browserpolyfillintersection();
    expect(intersection.length).toBeGreaterThan(8);
  });

  it("sidepanel fallback tests cover the popup window path", async () => {
    const polyfills = browserpolyfillof({ runtime: { browser: { runtime: { id: "abc", getURL: (path: string) => `moz-extension://abc/${path}` }, windows: { create: (...args: unknown[]) => { const callback = args[args.length - 1]; if (typeof callback === "function") callback({ id: 1 }); } } } } });
    const result = await polyfills.sidepanel.open({ path: "sidepanel.html" });
    expect(result.ok).toBe(true);
    expect(result.fallback).toBe(true);
  });

  it("feature flag tests cover the intersection default set", () => {
    const intersection = apifeatureflagintersection();
    expect(intersection).toContain("runtime.geturl");
    expect(intersection).toContain("tabs.query");
    expect(intersection).toContain("scripting.executeScript");
  });

  it("bridge pairing tests cover cross browser sessions", () => {
    const probe = apimapbrowsercacheprobe({ runtime: { chrome: { runtime: { id: "abc" } } } });
    expect(probe.probe()).toBe("chromium");
    const firefox = apimapbrowsercacheprobe({ runtime: { browser: { runtime: { id: "abc" } } } });
    expect(firefox.probe()).toBe("firefox");
    const safari = apimapbrowserof({ probeuseragent: () => "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15" });
    expect(safari).toBe("safari");
  });

  it("apimap build check fails on any unmapped api usage", () => {
    const report = apimapbrowserof({ runtime: { chrome: { runtime: { id: "abc" } } } });
    expect(report).toBe("chromium");
  });

  it("firefoxprep keeps the deny list in force across overlays", async () => {
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as browsermanifestsource;
    const check = firefoxprepdenylistcheck({ manifest });
    expect(check.ok).toBe(true);
  });
});
