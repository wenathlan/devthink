import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { artifactchannelof, artifactchannels, artifactmanifestcheck, artifactmanifestnameof, artifactmanifestof, artifactmanifesttext, rollbackpinnedset } from "../pack.js";

const checksumof = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const valid = "a".repeat(64);

describe("artifactmanifest", () => {
  it("records the name, the size and the sha256 checksum of every artifact with its channels", () => {
    const manifest = artifactmanifestof({ version: "1.1.87", artifacts: [{ name: "devthink1.1.87.zip", size: 1024, checksum: valid }] });
    expect(manifest.name).toBe("devthink artifact manifest");
    expect(manifest.version).toBe("1.1.87");
    expect(manifest.banner).toContain("devthink 1.1.87");
    expect(manifest.banner).toContain("GPL-3.0-only");
    expect(manifest.artifacts[0]).toEqual({ name: "devthink1.1.87.zip", size: 1024, checksum: valid, channels: ["github", "chromium", "nuget", "maven"] });
  });

  it("sorts the artifacts by name so the document renders deterministically", () => {
    const manifest = artifactmanifestof({ version: "1.1.87", artifacts: [
      { name: "devthink-site-1.1.87.zip", size: 5, checksum: valid },
      { name: "devthink-vscode-1.1.87.vsix", size: 6, checksum: valid },
      { name: "devthink1.1.87.zip", size: 4, checksum: valid },
    ] });
    expect(manifest.artifacts.map(entry => entry.name)).toEqual(["devthink-site-1.1.87.zip", "devthink-vscode-1.1.87.vsix", "devthink1.1.87.zip"]);
    /* the text of the same set renders byte identical on every run because no timestamp enters the document */
    expect(artifactmanifesttext(manifest)).toBe(artifactmanifesttext(artifactmanifestof({ version: "1.1.87", artifacts: [
      { name: "devthink-site-1.1.87.zip", size: 5, checksum: valid },
      { name: "devthink-vscode-1.1.87.vsix", size: 6, checksum: valid },
      { name: "devthink1.1.87.zip", size: 4, checksum: valid },
    ] })));
  });

  it("refuses an empty artifact set, a duplicate name and a non sha256 checksum", () => {
    expect(() => artifactmanifestof({ version: "1.1.87", artifacts: [] })).toThrow();
    expect(() => artifactmanifestof({ version: "1.1.87", artifacts: [{ name: "a.zip", size: 1, checksum: valid }, { name: "a.zip", size: 1, checksum: valid }] })).toThrow();
    expect(() => artifactmanifestof({ version: "1.1.87", artifacts: [{ name: "a.zip", size: 1, checksum: "short" }] })).toThrow();
    expect(() => artifactmanifestof({ version: "1.1.87", artifacts: [{ name: "", size: 1, checksum: valid }] })).toThrow();
    expect(() => artifactmanifestof({ version: "not-a-version", artifacts: [{ name: "a.zip", size: 1, checksum: valid }] })).toThrow();
  });

  it("resolves the publishing channels of the release artifact names", () => {
    expect(artifactchannels()).toEqual(["github", "npmjs", "githubpackages", "nuget", "maven", "container", "vscode", "firefox", "safari", "chromium", "site", "declarations", "provenance"]);
    expect(artifactchannelof("wenathlan-extension-1.1.87.tgz", "1.1.87")).toContain("npmjs");
    expect(artifactchannelof("extension.1.1.87.nupkg", "1.1.87")).toContain("nuget");
    expect(artifactchannelof("extension-1.1.87.pom", "1.1.87")).toContain("maven");
    expect(artifactchannelof("extension-container.json", "1.1.87")).toContain("container");
    expect(artifactchannelof("devthink-vscode-1.1.87.vsix", "1.1.87")).toContain("vscode");
    expect(artifactchannelof("devthink-firefox-1.1.87.xpi", "1.1.87")).toContain("firefox");
    expect(artifactchannelof("devthink-safari-1.1.87.zip", "1.1.87")).toContain("safari");
    expect(artifactchannelof("devthink1.1.87.zip", "1.1.87")).toContain("chromium");
    expect(artifactchannelof("devthink-site-1.1.87.zip", "1.1.87")).toContain("site");
    expect(artifactchannelof("devthink-declarations-1.1.87.zip", "1.1.87")).toContain("declarations");
    expect(artifactchannelof("devthink-sbom-1.1.87.json", "1.1.87")).toContain("provenance");
    /* an unrecognized name still rides the github asset channel because every release artifact attaches to the release */
    expect(artifactchannelof("unknown-artifact.bin", "1.1.87")).toEqual(["github"]);
    /* the dist bundles ride the npm channels */
    expect(artifactchannelof("dist/index.js", "1.1.87")).toEqual(["npmjs", "githubpackages"]);
  });

  it("names the manifest asset with the release version", () => {
    expect(artifactmanifestnameof("1.1.87")).toBe("devthink-artifactmanifest-1.1.87.json");
    expect(() => artifactmanifestnameof("not-a-version")).toThrow();
  });

  it("verifies a built or downloaded set matches the manifest exactly", () => {
    const manifest = artifactmanifestof({ version: "1.1.87", artifacts: [
      { name: "devthink1.1.87.zip", size: 10, checksum: checksumof("one") },
      { name: "devthink-site-1.1.87.zip", size: 20, checksum: checksumof("two") },
    ] });
    const okcheck = artifactmanifestcheck({ manifest, files: [
      { name: "devthink1.1.87.zip", checksum: checksumof("one") },
      { name: "devthink-site-1.1.87.zip", checksum: checksumof("two") },
    ] });
    expect(okcheck.ok).toBe(true);
    /* a missing artifact, a mismatched checksum and an unexpected extra file each fail the check */
    const missing = artifactmanifestcheck({ manifest, files: [{ name: "devthink-site-1.1.87.zip", checksum: checksumof("two") }] });
    expect(missing.ok).toBe(false);
    expect(missing.missing).toEqual(["devthink1.1.87.zip"]);
    const mismatched = artifactmanifestcheck({ manifest, files: [{ name: "devthink1.1.87.zip", checksum: checksumof("changed") }, { name: "devthink-site-1.1.87.zip", checksum: checksumof("two") }] });
    expect(mismatched.ok).toBe(false);
    expect(mismatched.mismatched).toEqual(["devthink1.1.87.zip"]);
    const unexpected = artifactmanifestcheck({ manifest, files: [
      { name: "devthink1.1.87.zip", checksum: checksumof("one") },
      { name: "devthink-site-1.1.87.zip", checksum: checksumof("two") },
      { name: "stray.bin", checksum: checksumof("stray") },
    ] });
    expect(unexpected.ok).toBe(false);
    expect(unexpected.unexpected).toEqual(["stray.bin"]);
    /* the checksums file itself stays ignorable beside the manifest */
    const withsums = artifactmanifestcheck({ manifest, files: [
      { name: "devthink1.1.87.zip", checksum: checksumof("one") },
      { name: "devthink-site-1.1.87.zip", checksum: checksumof("two") },
      { name: "SHA256SUMS.txt", checksum: checksumof("sums") },
    ] });
    expect(withsums.ok).toBe(true);
  });

  it("freezes the rollback pin of the previous release artifact set", () => {
    const previous = artifactmanifestof({ version: "1.1.86", artifacts: [
      { name: "devthink1.1.86.zip", size: 10, checksum: checksumof("previous") },
    ] });
    const pin = rollbackpinnedset({ previousversion: "1.1.86", manifest: previous });
    expect(pin.tag).toBe("v1.1.86");
    expect(pin.version).toBe("1.1.86");
    expect(pin.artifacts).toEqual([{ name: "devthink1.1.86.zip", checksum: checksumof("previous"), channels: ["github", "chromium", "nuget", "maven"] }]);
    expect(pin.procedure).toEqual([
      "checkout the immutable tag v1.1.86",
      "download the release assets of that tag",
      "verify every asset against the pinned checksums of this pin",
      "republish the pinned asset set on the channels the rollback covers",
    ]);
    /* the pin carries no download url, only the immutable tag and the digests */
    expect(JSON.stringify(pin)).not.toMatch(/https?:\/\//);
    /* a manifest of another version never freezes a pin */
    expect(() => rollbackpinnedset({ previousversion: "1.1.85", manifest: previous })).toThrow();
    expect(() => rollbackpinnedset({ previousversion: "not-a-version", manifest: previous })).toThrow();
  });
});
