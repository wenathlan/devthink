import { describe, expect, it } from "vitest";
import { xpipackassemble, xpimanifestname, xpinameof, xpipacklintercheck, xpipackentriesof, xpilinterbudget, xpimanifestheader, xpicentraldirectory, xpiendrecord } from "../crossbrowser.js";
import type { browsermanifestsource, xpipackinput } from "../types.js";

const manifest: browsermanifestsource = {
  manifest_version: 3,
  name: "Devthink",
  version: "1.1.86",
  description: "test",
  permissions: ["activeTab", "storage", "scripting"],
  optional_permissions: ["tabs", "downloads", "clipboardRead", "clipboardWrite", "nativeMessaging"],
  optional_host_permissions: ["https://*/*"],
  background: { scripts: ["background.js"] },
  browser_specific_settings: { gecko: { id: "devthink@wenathlan", strict_min_version: "115.0" } },
};

describe("xpipack", () => {
  it("assembles the firefox build into a zip ready for signing", () => {
    const input: xpipackinput = { manifest, bundleentries: [{ name: "background.js", bytes: new Uint8Array([0, 1, 2]) }], version: "1.1.86" };
    const output = xpipackassemble(input);
    expect(output.archive.name).toBe("devthink-1.1.86.xpi");
    expect(output.archive.bytes.length).toBeGreaterThan(50);
    expect(output.entries).toContain("manifest.json");
    expect(output.entries).toContain("background.js");
  });

  it("embeds the browser specific manifest and the hashed assets", () => {
    const input: xpipackinput = { manifest, bundleentries: [{ name: "popup.abc123.js", bytes: new Uint8Array([10, 20, 30]) }, { name: "popup.html", bytes: new Uint8Array([40, 50]) }], version: "1.1.86" };
    const output = xpipackassemble(input);
    expect(output.entries).toContain("popup.abc123.js");
    expect(output.entries).toContain("popup.html");
    expect(output.manifestname).toBe("manifest.json");
  });

  it("names the artifact with the release version", () => {
    expect(xpinameof("1.1.86")).toBe("devthink-1.1.86.xpi");
    expect(() => xpinameof("not-a-version")).toThrow();
  });

  it("output passes the addons linter with zero errors inside the budget", () => {
    const input: xpipackinput = { manifest, bundleentries: [{ name: "background.js", bytes: new Uint8Array([0]) }], version: "1.1.86" };
    const output = xpipackassemble(input);
    expect(output.lintermarkers.errors).toBe(0);
    const check = xpipacklintercheck({ markers: output.lintermarkers, budget: xpilinterbudget });
    expect(check.ok).toBe(true);
    const refused = xpipacklintercheck({ markers: { errors: 1, warnings: 0 }, budget: xpilinterbudget });
    expect(refused.ok).toBe(false);
  });

  it("places the manifest at the archive root the firefox addons linter requires", () => {
    expect(xpimanifestname()).toBe("manifest.json");
  });

  it("keeps every entry stored uncompressed so the addons linter reads the manifest and the bundles without a deflate step", () => {
    const header = xpimanifestheader("manifest.json", Buffer.from("{}", "utf8"));
    expect(header.readUInt32LE(0)).toBe(0x04034b50);
    expect(header.readUInt16LE(8)).toBe(0); // stored, no compression
    const central = xpicentraldirectory([{ name: "manifest.json", size: 2, offset: 0 }]);
    expect(central.bytes.readUInt32LE(0)).toBe(0x02014b50);
    expect(central.bytes.readUInt32LE(20)).toBe(2);
    expect(central.bytes.readUInt32LE(42)).toBe(0);
    const end = xpiendrecord(1, central.bytes.length, header.length);
    expect(end.readUInt32LE(0)).toBe(0x06054b50);
    expect(end.readUInt16LE(8)).toBe(1);
    expect(end.readUInt32LE(16)).toBe(header.length);
    /* the assembled archive reads back through the standard structure: the end record points at the central directory and every central offset lands on a local file header signature, so the standard unzip tooling and the addons linter list the xpi without a repair pass */
    const output = xpipackassemble({ manifest, bundleentries: [{ name: "background.js", bytes: new Uint8Array([1, 2, 3]) }], version: "1.1.86" });
    const archive = Buffer.from(output.archive.bytes);
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

  it("lists the entries the xpipack archive carries", () => {
    const input: xpipackinput = { manifest, bundleentries: [{ name: "background.js", bytes: new Uint8Array([0, 1, 2]) }, { name: "popup.html", bytes: new Uint8Array([0, 1, 2]) }], version: "1.1.86" };
    const output = xpipackassemble(input);
    expect(xpipackentriesof(output)).toEqual(["manifest.json", "background.js", "popup.html"]);
  });

  it("refuses a manifest with required host permissions", () => {
    const withHosts: browsermanifestsource = { ...manifest, host_permissions: ["https://example.com/*"] };
    expect(() => xpipackassemble({ manifest: withHosts, bundleentries: [], version: "1.1.86" })).toThrow();
  });
});
