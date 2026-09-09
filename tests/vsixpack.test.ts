import { describe, expect, it } from "vitest";
import {
  vsixcontenttypes,
  vsixextensionhost,
  vsixnameof,
  vsixpackassemble,
  vsixpackentriesof,
  vsixpackmanifest,
  vsixpackmanifestfields,
  vsixmarketplacemetadatacheck,
  vsixvsixmanifest,
  vsixwebviewpage,
  vsixzipof,
} from "../pack.js";

const esmbytes = new Uint8Array([101, 115, 109, 32, 98, 111, 100, 121]);

describe("vsixpack", () => {
  it("names the artifact with the release version", () => {
    expect(vsixnameof("1.1.87")).toBe("devthink-vscode-1.1.87.vsix");
    expect(() => vsixnameof("not-a-version")).toThrow();
  });

  it("declares the extension capabilities and commands with no telemetry and no network default", () => {
    const fields = vsixpackmanifestfields("1.1.87");
    expect(fields.name).toBe("devthink");
    expect(fields.publisher).toBe("wenathlan");
    expect(fields.version).toBe("1.1.87");
    expect(fields.engines.vscode ?? "").not.toBe("");
    expect(fields.commands.map((command) => command.command)).toEqual(["devthink.openbridge", "devthink.settings"]);
    expect(fields.telemetry).toBe("off");
    expect(fields.relayurldefault).toBe("");
    expect(fields.configuration[0]?.default).toBe("");
  });

  it("assembles the vsix package with the manifest at the root and the webview inside the extension folder", () => {
    const output = vsixpackassemble({ version: "1.1.87", esmbundlebytes: esmbytes });
    expect(output.archive.name).toBe("devthink-vscode-1.1.87.vsix");
    expect(output.entries).toEqual([
      "extension.vsixmanifest",
      "[Content_Types].xml",
      "extension/package.json",
      "extension/extensionhost.js",
      "extension/webview/bridge.html",
      "extension/index.js",
    ]);
    expect(vsixpackentriesof(output)).toEqual(output.entries);
    expect(output.archive.bytes.length).toBeGreaterThan(500);
    expect(() => vsixpackassemble({ version: "1.1.87", esmbundlebytes: new Uint8Array([]) })).toThrow();
    expect(() => vsixpackassemble({ version: "not-a-version", esmbundlebytes: esmbytes })).toThrow();
  });

  it("reuses the library esm build inside the webview unchanged", () => {
    const output = vsixpackassemble({ version: "1.1.87", esmbundlebytes: esmbytes });
    const files = vsixzipof([{ path: "extension/index.js", bytes: Buffer.from(esmbytes) }]);
    expect(files.length).toBeGreaterThanOrEqual(esmbytes.length);
    /* the esm bytes ride the archive through the zip builder the package carries */
    const body = Buffer.from(output.archive.bytes);
    expect(body.subarray(0, 4).readUInt32LE(0)).toBe(0x04034b50);
    expect(body.includes(Buffer.from(esmbytes))).toBe(true);
  });

  it("keeps the consent gates inside the webview ui and connects only through the user configured url", () => {
    const page = vsixwebviewpage("/relay");
    expect(page).toContain("Consent gate");
    expect(page).toContain("offline: no relay url configured");
    expect(page).toContain("Pair after review");
    expect(page).not.toMatch(/wss:\/\/[^"<\s]+/);
    expect(page).not.toContain("https://");
  });

  it("runs the chatbridge surface in a webview panel through the extension host", () => {
    const host = vsixextensionhost();
    expect(host).toContain("createWebviewPanel");
    expect(host).toContain("devthink.openbridge");
    expect(host).toContain("devthink.settings");
    expect(host).toContain("enableScripts: true");
    /* the host opens no telemetry logger and names no endpoint of its own — the header comment states the no telemetry posture */
    expect(host).not.toContain("createTelemetryLogger");
    expect(host).toContain("no telemetry");
    expect(host).not.toMatch(/https?:\/\/(?!github\.com)[^"'\s]+/);
  });

  it("carries the content types and the vsix manifest of a plain zip based vsix", () => {
    const fields = vsixpackmanifestfields("1.1.87");
    const manifest = vsixvsixmanifest(fields, ["extension/package.json"]);
    expect(manifest).toContain('<PackageManifest Version="2.0.0"');
    expect(manifest).toContain(`Id="devthink" Version="1.1.87" Publisher="wenathlan"`);
    expect(manifest).toContain("Microsoft.VisualStudio.Code.Engine");
    expect(manifest).not.toContain("marketplace");
    const contenttypes = vsixcontenttypes();
    expect(contenttypes).toContain('<Default Extension="vsixmanifest"');
    expect(contenttypes).toContain('<Default Extension="json"');
  });

  it("builds a stored zip archive every zip reader resolves without a scan", () => {
    const archive = vsixzipof([
      { path: "a.txt", bytes: Buffer.from("devthink", "utf8") },
      { path: "b/c.txt", bytes: Buffer.from("bridge", "utf8") },
    ]);
    expect(archive.readUInt32LE(0)).toBe(0x04034b50);
    /* the end of central directory record counts both entries and points at the central directory */
    const end = archive.subarray(archive.length - 22);
    expect(end.readUInt32LE(0)).toBe(0x06054b50);
    expect(end.readUInt16LE(8)).toBe(2);
    const centralstart = end.readUInt32LE(16);
    expect(archive.subarray(centralstart, centralstart + 4).readUInt32LE(0)).toBe(0x02014b50);
  });

  it("validates the marketplace metadata of the package fields", () => {
    const fields = vsixpackmanifestfields("1.1.87");
    const manifesttext = vsixpackmanifest(fields);
    expect(vsixmarketplacemetadatacheck({ fields, manifesttext }).ok).toBe(true);
    /* a missing identity, a telemetry statement, a network default, a marketplace endpoint or a download url each fail the check */
    expect(vsixmarketplacemetadatacheck({ fields: { ...fields, name: "" }, manifesttext }).ok).toBe(false);
    expect(vsixmarketplacemetadatacheck({ fields: { ...fields, publisher: "" }, manifesttext }).ok).toBe(false);
    expect(vsixmarketplacemetadatacheck({ fields: { ...fields, version: "latest" }, manifesttext }).ok).toBe(false);
    expect(
      vsixmarketplacemetadatacheck({
        fields: { ...fields, telemetry: "off" as const, relayurldefault: "wss://example.invalid/relay" as "" },
        manifesttext,
      }).ok,
    ).toBe(false);
    expect(
      vsixmarketplacemetadatacheck({
        fields,
        manifesttext: `${manifesttext} https://marketplace.visualstudio.com/items`,
      }).ok,
    ).toBe(false);
    expect(
      vsixmarketplacemetadatacheck({
        fields,
        manifesttext: `${manifesttext} https://example.invalid/download/devthink.vsix`,
      }).ok,
    ).toBe(false);
  });

  it("carries no vendor marketplace url and no download url anywhere in the assembled package", () => {
    const output = vsixpackassemble({ version: "1.1.87", esmbundlebytes: esmbytes });
    const text = Buffer.from(output.archive.bytes).toString("utf8");
    expect(text).not.toMatch(/marketplace\.visualstudio\.com|clients2\.google\.com|visualstudio\.gallery/i);
    expect(text).not.toMatch(/https?:\/\/[^\s"<>]*(download|installer|update)[^\s"<>]*/i);
    expect(text).not.toContain("clients2.google.com");
  });
});
