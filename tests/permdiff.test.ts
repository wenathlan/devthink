import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { diffpermissionsets, permissionsetof, previousof } from "./permdiff.mjs";

/* ── The 1.1.95 permission diff logic against fixture manifests. ── */

const basemanifest = {
  manifest_version: 3,
  version: "1.0.0",
  permissions: ["activeTab", "storage", "scripting", "sidePanel"],
  optional_permissions: ["tabs", "downloads", "clipboardRead", "clipboardWrite", "offscreen", "nativeMessaging"],
  optional_host_permissions: ["https://*/*"],
};

describe("the permdiff logic", () => {
  it("reads the permission set of a manifest in its declared order with its set tags", () => {
    const set = permissionsetof(basemanifest);
    expect(set.required).toEqual([
      "required:activeTab",
      "required:storage",
      "required:scripting",
      "required:sidePanel",
    ]);
    expect(set.optional).toHaveLength(6);
    expect(set.optionalhost).toEqual(["optionalhost:https://*/*"]);
    expect(set.entries).toHaveLength(11);
  });

  it("reports a clean diff when the fixture manifests carry the same permission set", () => {
    const diff = diffpermissionsets(permissionsetof(basemanifest), permissionsetof({ ...basemanifest }));
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.reordered).toEqual([]);
  });

  it("reports every added permission a fixture manifest gains", () => {
    const grown = { ...basemanifest, permissions: [...basemanifest.permissions, "debugger"] };
    const diff = diffpermissionsets(permissionsetof(grown), permissionsetof(basemanifest));
    expect(diff.added).toEqual(["required:debugger"]);
    expect(diff.removed).toEqual([]);
    expect(diff.reordered).toEqual([]);
  });

  it("reports every removed permission and every move between the required and the optional sets", () => {
    const shrunk = { ...basemanifest, permissions: basemanifest.permissions.slice(0, 3) };
    const diff = diffpermissionsets(permissionsetof(shrunk), permissionsetof(basemanifest));
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual(["required:sidePanel"]);
    const moved = {
      ...basemanifest,
      permissions: basemanifest.permissions.slice(0, 3),
      optional_permissions: [...basemanifest.optional_permissions, "sidePanel"],
    };
    const moveddiff = diffpermissionsets(permissionsetof(moved), permissionsetof(basemanifest));
    expect(moveddiff.added).toEqual(["optional:sidePanel"]);
    expect(moveddiff.removed).toEqual(["required:sidePanel"]);
    expect(moveddiff.reordered).toEqual([]);
  });

  it("reports a reordered set when the same permissions appear in a different order", () => {
    const reordered = { ...basemanifest, permissions: [...basemanifest.permissions.slice(1), "activeTab"] };
    const diff = diffpermissionsets(permissionsetof(reordered), permissionsetof(basemanifest));
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.reordered).toEqual(["required"]);
  });

  it("resolves the previous release version of the package", async () => {
    expect(previousof("1.1.95")).toBe("1.1.94");
    expect(previousof("1.2.0")).toBe("1.1.0");
    expect(previousof("2.0.0")).toBe("1.0.0");
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as typeof basemanifest;
    expect(
      manifest.permissions.length + manifest.optional_permissions.length + manifest.optional_host_permissions.length,
    ).toBe(permissionsetof(manifest).entries.length);
    /* the permission set hash the gate records covers the sorted unique entries of the current manifest */
    const entries = permissionsetof(manifest).entries;
    const digest = createHash("sha256")
      .update([...new Set(entries)].sort().join("\n"))
      .digest("hex");
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });
});
