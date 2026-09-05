import { describe, expect, it } from "vitest";
import { safariskeletonbuild, safariskeletonprojectfiles, safariskeletonpopoverof, safarizipfile, safaricentraldirectory, safariendrecord } from "../crossbrowser.js";
import type { safariskeletoninput } from "../types.js";

const input: safariskeletoninput = {
  version: "1.1.86",
  bundleid: "com.wenathlan.devthink",
  extensionpayload: [{ name: "manifest.json", bytes: new Uint8Array([0, 1, 2]) }, { name: "background.js", bytes: new Uint8Array([3, 4, 5]) }],
  entitlements: ["com.apple.security.app-sandbox", "com.apple.security.network.client"],
};

describe("safariskeleton", () => {
  it("generates the xcode project wrapper for the extension", () => {
    const files = safariskeletonprojectfiles();
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(file => file.path.endsWith("project.pbxproj"))).toBe(true);
    expect(files.some(file => file.path.endsWith("Info.plist"))).toBe(true);
    expect(files.some(file => file.path.endsWith("AppDelegate.swift"))).toBe(true);
  });

  it("embeds the chromium build as the safari web extension payload", () => {
    const output = safariskeletonbuild(input);
    expect(output.archive.name).toBe("devthink-safari-1.1.86.zip");
    expect(output.archive.bytes.length).toBeGreaterThan(100);
    expect(output.projectfiles.length).toBeGreaterThan(0);
  });

  it("declares the app entitlements for extension distribution", () => {
    const output = safariskeletonbuild(input);
    expect(output.entitlements).toContain("com.apple.security.app-sandbox");
    expect(output.entitlements).toContain("com.apple.security.network.client");
    const entitlementsfile = safariskeletonprojectfiles().find(file => file.path.endsWith(".entitlements"));
    expect(entitlementsfile).toBeDefined();
    expect(entitlementsfile?.text).toContain("com.apple.security.app-sandbox");
  });

  it("includes a minimal app shell that opens the extension", () => {
    const output = safariskeletonbuild(input);
    expect(output.appshell).toBe("Devthink/AppDelegate.swift");
    const shell = safariskeletonprojectfiles().find(file => file.path.endsWith("AppDelegate.swift"));
    expect(shell?.text).toContain("SFSafariApplication");
  });

  it("renders the sidepanel surface as a popover equivalent", () => {
    const popover = safariskeletonpopoverof();
    expect(popover.path).toBe("sidepanel.html");
    expect(popover.bounds.width).toBe(480);
    expect(popover.bounds.height).toBe(720);
  });

  it("stamps the release version into the project files", () => {
    const output = safariskeletonbuild(input);
    const plist = output.projectfiles.find(file => file.path.endsWith("Info.plist"));
    expect(plist?.text).toContain("1.1.86");
  });

  it("stamps the bundle id into the project files", () => {
    const output = safariskeletonbuild(input);
    const plist = output.projectfiles.find(file => file.path.endsWith("Info.plist"));
    expect(plist?.text).toContain("com.wenathlan.devthink");
  });

  it("refuses an empty payload or an empty entitlements list", () => {
    expect(() => safariskeletonbuild({ ...input, extensionpayload: [] })).toThrow();
    expect(() => safariskeletonbuild({ ...input, entitlements: [] })).toThrow();
  });

  it("refuses a non semver version or an invalid bundle id", () => {
    expect(() => safariskeletonbuild({ ...input, version: "not-a-version" })).toThrow();
    expect(() => safariskeletonbuild({ ...input, bundleid: "" })).toThrow();
    expect(() => safariskeletonbuild({ ...input, bundleid: "Invalid Bundle Id" })).toThrow();
  });

  it("writes the wrapper files and the payload entries as stored zip entries with readable offsets", () => {
    const header = safarizipfile("Resources/manifest.json", Buffer.from("{}", "utf8"));
    expect(header.readUInt32LE(0)).toBe(0x04034b50);
    expect(header.readUInt16LE(8)).toBe(0);
    const central = safaricentraldirectory([{ name: "Resources/manifest.json", size: 2, offset: 0 }]);
    expect(central.bytes.readUInt32LE(0)).toBe(0x02014b50);
    expect(central.bytes.readUInt32LE(20)).toBe(2);
    expect(central.bytes.readUInt32LE(42)).toBe(0);
    const end = safariendrecord(1, central.bytes.length, header.length);
    expect(end.readUInt32LE(0)).toBe(0x06054b50);
    expect(end.readUInt32LE(16)).toBe(header.length);
    /* the assembled archive reads back through the standard structure: the end record points at the central directory and every central offset lands on a local file header signature */
    const built = safariskeletonbuild({ version: "1.1.87", bundleid: "devthink.wenathlan.safari", extensionpayload: [{ name: "manifest.json", bytes: new Uint8Array([123, 125]) }], entitlements: ["com.apple.security.app-sandbox"] });
    const archive = Buffer.from(built.archive.bytes);
    const endoffset = archive.length - 22;
    expect(archive.readUInt32LE(endoffset)).toBe(0x06054b50);
    const centralstart = archive.readUInt32LE(endoffset + 16);
    const entrycount = archive.readUInt16LE(endoffset + 10);
    expect(archive.readUInt32LE(centralstart)).toBe(0x02014b50);
    let cursor = centralstart;
    for (let index = 0; index < entrycount; index += 1) {
      const localoffset = archive.readUInt32LE(cursor + 42);
      expect(archive.readUInt32LE(localoffset)).toBe(0x04034b50);
      cursor += 46 + archive.readUInt16LE(cursor + 28);
    }
  });
});
