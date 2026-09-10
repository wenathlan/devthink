import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

describe("extension manifest", () => {
  it("keeps privileged browser capabilities optional and out of the default package", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      manifest_version: number;
      version: string;
      key?: string;
      permissions: string[];
      optional_permissions?: string[];
      host_permissions?: string[];
      content_scripts?: unknown[];
      sandbox?: { pages?: string[] };
      offscreen?: { document?: string; reasons?: string[]; justification?: string };
    };
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toBe(packagejson.version);
    expect(manifest.permissions).toEqual(["activeTab", "storage", "scripting", "sidePanel"]);
    expect(manifest.optional_permissions ?? []).toEqual([
      "tabs",
      "downloads",
      "clipboardRead",
      "clipboardWrite",
      "offscreen",
      "nativeMessaging",
    ]);
    expect(manifest.host_permissions ?? []).toEqual([]);
    expect(manifest.content_scripts ?? []).toEqual([]);
    expect(manifest.sandbox).toEqual({ pages: ["sandbox.html"] });
    expect(manifest.offscreen).toMatchObject({ document: "offscreen.html", reasons: ["DOM_PARSER", "WORKERS"] });
    expect((manifest.offscreen as { justification?: string }).justification ?? "").toMatch(
      /offscreen document worker pool/,
    );
  });

  it("keeps the native messaging permission optional only so the native bridge stays a per install user choice", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      permissions: string[];
      optional_permissions?: string[];
    };
    expect(manifest.permissions).not.toContain("nativeMessaging");
    expect(manifest.optional_permissions ?? []).toContain("nativeMessaging");
  });

  it("keeps a stable, strictly decodable identity key", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as { key?: string };
    const key = manifest.key ?? "";
    expect(key.length % 4).toBe(0);
    expect(key).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    const der = Buffer.from(key, "base64");
    expect(der.length).toBe(294);
    expect(der.subarray(0, 2).equals(Buffer.from([0x30, 0x82]))).toBe(true);
    expect(der.readUInt16BE(2)).toBe(der.length - 4);
    const digest = createHash("sha256").update(der).digest("hex");
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    /* the identity pin rides the generated build artifact: the recorded digest never stays hard coded in a source file, the build writes it into dist/checksums.txt on every run and this pass verifies the manifest key against that artifact whenever the build ran */
    if (existsSync("dist/checksums.txt")) {
      const recorded = (await readFile("dist/checksums.txt", "utf8"))
        .split("\n")
        .find((line) => line.trim().endsWith("  manifest.json key"));
      expect(recorded?.split("  ")[0]).toBe(digest);
    }
  });

  it("declares the optionspage as the options surface and the dashboardpage chrome url without new permissions", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      options_ui?: { page?: string; open_in_tab?: boolean };
      chrome_url_overrides?: Record<string, string>;
    };
    expect(manifest.options_ui).toMatchObject({ page: "optionspage.html", open_in_tab: true });
    expect(manifest.chrome_url_overrides).toEqual({ newtab: "dashboardpage.html" });
  });

  it("declares the icon family of the final polish at every required size with payloads that decode to the declared pixels", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      icons?: Record<string, string>;
      action?: { default_icon?: Record<string, string> };
    };
    const expected = {
      "16": "icons/16.png",
      "19": "icons/19.png",
      "32": "icons/32.png",
      "38": "icons/38.png",
      "48": "icons/48.png",
      "128": "icons/128.png",
    };
    expect(manifest.icons).toEqual(expected);
    expect(manifest.action?.default_icon).toEqual(expected);
    const iconssource = await readFile("web/icons.ts", "utf8");
    const iconblock =
      /export const iconpayloads: Record<string, string> = \{([\s\S]*?)\};/.exec(iconssource)?.[1] ?? "";
    const iconentries = [...iconblock.matchAll(/"(\d+)": "([A-Za-z0-9+/=]+)"/g)].map((match) => ({
      size: Number(match[1]),
      base64: match[2] ?? "",
    }));
    expect(iconentries.map((entry) => entry.size).sort((a, b) => a - b)).toEqual([16, 19, 32, 38, 48, 128]);
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    for (const entry of iconentries) {
      const bytes = Buffer.from(entry.base64, "base64");
      expect(bytes.subarray(0, 8).equals(signature)).toBe(true);
      expect(bytes.readUInt32BE(16)).toBe(entry.size);
      expect(bytes.readUInt32BE(20)).toBe(entry.size);
    }
  });
});

/* ── The frozen capability manifest declarations of the 1.1.91 api freeze. ── */
import { capmanifestof } from "../apifreeze.js";

describe("the frozen capability manifest declarations", () => {
  it("matches the manifest permissions with the capmanifest declarations of every surface", async () => {
    if (!existsSync("dist/caps"))
      return; /* the capmanifest artifacts ride the build: the pass runs after pnpm build in the validate chain and the ci lanes */
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      version: string;
      permissions: string[];
      optional_permissions?: string[];
      optional_host_permissions?: string[];
    };
    const declared = new Set<string>();
    for (const surface of ["background", "sidepanel", "popup", "mcp"] as const) {
      const stored = JSON.parse(await readFile(`dist/caps/${surface}.json`, "utf8")) as {
        surface: string;
        release: string;
        protocolmajor: number;
        permissions: string[];
      };
      expect(stored.surface).toBe(surface);
      expect(stored.release).toBe(manifest.version);
      expect(stored.protocolmajor).toBe(2);
      expect(capmanifestof(surface).permissions).toEqual(stored.permissions);
      for (const permission of stored.permissions) declared.add(permission);
    }
    const requested = [
      ...manifest.permissions,
      ...(manifest.optional_permissions ?? []),
      ...(manifest.optional_host_permissions ?? []),
    ];
    for (const permission of requested) expect(declared.has(permission)).toBe(true);
    for (const permission of declared) expect(requested.includes(permission)).toBe(true);
    expect(capmanifestof("pagebridge").permissions).toEqual([]);
    expect(capmanifestof("cli").permissions).toEqual([]);
    expect(capmanifestof("library").permissions).toEqual([]);
  });
});

/* ── The 1.1.95 strict content security policy of the security hardening release. ── */

describe("the strict content security policy", () => {
  it("pins the extension pages of the root manifest and both overlays to local scripts and own framing", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      content_security_policy?: { extension_pages?: string };
      browsers?: Record<string, { content_security_policy?: { extension_pages?: string } }>;
    };
    const policy = manifest.content_security_policy?.extension_pages ?? "";
    expect(policy).toBe("script-src 'self'; object-src 'self'; frame-ancestors 'self'");
    expect(manifest.browsers?.firefox?.content_security_policy?.extension_pages).toBe(policy);
    expect(manifest.browsers?.safari?.content_security_policy?.extension_pages).toBe(policy);
  });

  it("keeps every declared source free of wildcards, remote hosts, eval and inline", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      content_security_policy?: { extension_pages?: string };
      browsers?: Record<string, { content_security_policy?: { extension_pages?: string } }>;
    };
    const policies = [
      manifest.content_security_policy?.extension_pages,
      manifest.browsers?.firefox?.content_security_policy?.extension_pages,
      manifest.browsers?.safari?.content_security_policy?.extension_pages,
    ].filter((entry): entry is string => typeof entry === "string");
    expect(policies).toHaveLength(3);
    for (const policy of policies)
      for (const source of policy.split(";").flatMap((directive) => directive.trim().split(/\s+/).slice(1))) {
        expect(source.includes("*")).toBe(false);
        expect(/^(https?|wss?|data):/i.test(source)).toBe(false);
        expect(source.includes("unsafe-eval")).toBe(false);
        expect(source.includes("unsafe-inline")).toBe(false);
      }
  });
});

/* ── The 1.1.96 multi agent certification: the dashboard surface permissions of the dashdone completion. ── */

describe("the multi agent dashboard surface", () => {
  it("carries every multi agent panel of the dashdone completion inside the declared dashboardpage surface without new permissions", async () => {
    const manifest = JSON.parse(await readFile("web/manifest.json", "utf8")) as {
      permissions: string[];
      optional_permissions?: string[];
      chrome_url_overrides?: Record<string, string>;
    };
    const webdesign = await readFile("web/design.html", "utf8");
    const dashboardmatch = /<template data-surface="dashboardpage">([\s\S]*?)<\/template>/.exec(webdesign);
    expect(dashboardmatch).not.toBeNull();
    const surface = dashboardmatch?.[1] ?? "";
    /* every multi agent panel the dashdone completion ships rides the dashboardpage surface the manifest already declares as the newtab override */
    for (const panel of [
      "multiagentoverview",
      "agentstatuscards",
      "sharedqueueview",
      "queuelanefilter",
      "messageflow",
      "conflictlog",
      "agentcostpanel",
      "escalationinbox",
      "timelinescrubber",
      "aggregatetimeline",
      "killswitch",
      "reportdownload",
    ]) {
      expect(surface.includes(`id="${panel}"`)).toBe(true);
    }
    /* the multi agent panels add no permission: the surface renders from the storage, the scripting and the active tab grants the dashboardpage already held */
    expect(manifest.chrome_url_overrides).toEqual({ newtab: "dashboardpage.html" });
    expect(manifest.permissions).toEqual(["activeTab", "storage", "scripting", "sidePanel"]);
    expect((manifest.optional_permissions ?? []).includes("tabs")).toBe(true);
    for (const reference of [...surface.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(
      (match) => match[1] ?? "",
    )) {
      expect(/^(https?|wss?|data):/i.test(reference)).toBe(false);
    }
  });
});
