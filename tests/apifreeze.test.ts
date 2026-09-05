import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apifreezedate, apifreezerelease, backgroundsurfacemessages, capmanifestdiff, capmanifestof, clisurfacecommands, deprecationnoticeof, deprecatedfields, deprecationwindow, librarysurfaceexports, mcpsurfacekinds, mcpsurfacetools, negotiateprotocol, pagebridgesurfacemessages, permissioncoverage, popupsurfacemessages, protocolmajorof, protocolsupported, sharedprotocolversion, sidepanelsurfacemessages, warnonce } from "../apifreeze.js";
import { actionkindids, pinnedprotocolversion, protocolmajorversion, protocolversion } from "../types.js";
import { errorcodetable, framingrules, frozenmessagecatalog, memoryitemframe, responseenvelopeoutcomes, stabilityrules } from "../protocol.js";
import { alltools, buildtoolcatalog } from "../tools.js";
import { capmanifestdriftgate, protocolnegotiationgate, unknownfieldsgate } from "../policy.js";

describe("the protocolv2 api freeze of 1.1.91", () => {
  it("pins the protocol major two across the version constants", () => {
    expect(protocolmajorversion).toBe(2);
    expect(pinnedprotocolversion.protocolmajor).toBe(2);
    expect(pinnedprotocolversion.protocolversion).toBe(protocolversion);
    expect(protocolsupported).toEqual({ minimum: 2, maximum: 2 });
    expect(apifreezerelease).toBe("1.1.91");
    expect(apifreezedate).toBe("2026-08-31");
  });

  it("negotiates the protocol major with new and future clients and refuses version one below the floor", () => {
    expect(negotiateprotocol({})).toEqual({ agreed: true, major: 2 });
    expect(negotiateprotocol({ client: 2 })).toEqual({ agreed: true, major: 2 });
    expect(negotiateprotocol({ client: "2.0.0" })).toEqual({ agreed: true, major: 2 });
    /* the 2.0.0 sunset closed the window: a version one declaration refuses below the floor the sunset raised, with the migration path inside the refusal */
    const legacy = negotiateprotocol({ client: "1.1.54" });
    expect(legacy.agreed).toBe(false);
    expect(legacy.reason).toContain("below the supported floor of 2");
    expect(legacy.reason).toContain("migrateplan");
    expect(legacy.reason).toContain("docs/migrationguide.md");
    expect(negotiateprotocol({ client: 1 }).agreed).toBe(false);
    const future = negotiateprotocol({ client: "3.0.0" });
    expect(future.agreed).toBe(false);
    expect(future.reason).toContain("the supported protocol versions are 2 through 2");
    expect(negotiateprotocol({ client: "0.0.1" }).agreed).toBe(false);
    expect(protocolmajorof(undefined)).toBeUndefined();
    expect(protocolmajorof(2)).toBe(2);
    expect(protocolmajorof("")).toBeUndefined();
  });

  it("answers the highest shared protocol major of one client list", () => {
    /* the floor raise filters the version one side away: a list that carries both majors negotiates up to two while a version one only list answers the empty intersection */
    expect(sharedprotocolversion([1, 2])).toEqual({ shared: true, major: 2 });
    expect(sharedprotocolversion([2, 3])).toEqual({ shared: true, major: 2 });
    expect(sharedprotocolversion([1, 3]).shared).toBe(false);
    expect(sharedprotocolversion([1]).shared).toBe(false);
    expect(sharedprotocolversion([3, 4]).shared).toBe(false);
    expect(sharedprotocolversion([3, 4]).reason).toContain("supported range of 2 through 2");
  });

  it("gates the negotiation and the unknown fields by the negotiated major", () => {
    expect(protocolnegotiationgate({})).toEqual({ allowed: true, major: 2, reason: expect.stringContaining("protocolv2 default") });
    /* the 2.0.0 sunset semantics: the version one branch of the gate refuses below the floor and names the conversion path */
    const legacy = protocolnegotiationgate({ client: "1.1.54" });
    expect(legacy.allowed).toBe(false);
    expect(legacy.major).toBeUndefined();
    expect(legacy.reason).toContain("below the supported floor");
    expect(legacy.reason).toContain("migrateplan");
    expect(legacy.reason).toContain("docs/migrationguide.md");
    expect(protocolnegotiationgate({ client: "3.0.0" }).allowed).toBe(false);
    expect(protocolnegotiationgate({ client: "3.0.0" }).reason).toContain("supported protocol versions are 2 through 2");
    expect(unknownfieldsgate({ unknown: [], major: 2 }).allowed).toBe(true);
    expect(unknownfieldsgate({ unknown: ["mysteryfield"], major: 2 }).allowed).toBe(false);
    expect(unknownfieldsgate({ unknown: ["mysteryfield"], major: 2 }).reason).toContain("Strict schema validation");
    /* the version one tolerance closed with the window: the strict refusal answers every major the line accepts and the closed branch records the sunset */
    expect(unknownfieldsgate({ unknown: ["mysteryfield"], major: 1 }).allowed).toBe(false);
    expect(unknownfieldsgate({ unknown: ["mysteryfield"], major: 1 }).reason).toContain("closed at 2.0.0");
    expect(capmanifestdriftgate({ drift: [] }).allowed).toBe(true);
    expect(capmanifestdriftgate({ drift: ["removed message capmanifest"] }).allowed).toBe(false);
  });

  it("records the executed 2.0.0 sunset with the empty registry and the window history", () => {
    /* the 2.0.0 sunset removed every deprecated field the window carried: the registry hashes as the empty contract while the window record stays as history */
    expect(deprecatedfields).toEqual([]);
    expect(deprecationwindow).toEqual({ opens: "1.1.91", closes: "2.0.0" });
    expect(deprecationnoticeof("umd", "Devthink")).toBeUndefined();
    expect(deprecationnoticeof("mcp", "protocolversion")).toBeUndefined();
    /* warnonce stays intact and answers silence for every pair the empty registry no longer registers */
    const first = warnonce({ warned: new Set<string>(), surface: "umd", field: "Devthink" });
    expect(first.notice).toBeUndefined();
    expect(first.warned.has("umd.Devthink")).toBe(false);
    expect(warnonce({ warned: first.warned, surface: "umd", field: "Devthink" }).notice).toBeUndefined();
    expect(warnonce({ warned: new Set<string>(), surface: "mcp", field: "protocolversion" }).notice).toBeUndefined();
    expect(warnonce({ warned: new Set<string>(), surface: "nowhere", field: "unknown" }).notice).toBeUndefined();
  });

  it("freezes the immutable action kind identifiers with the policy vocabulary", () => {
    expect(actionkindids.length).toBe(335);
    expect(new Set(actionkindids).size).toBe(actionkindids.length);
    for (const kind of actionkindids) expect(kind).toMatch(/^[a-z0-9]+$/);
  });

  it("freezes the response envelope, the error code table and the framing rules", () => {
    expect(responseenvelopeoutcomes).toEqual(["success", "error", "cancel"]);
    expect(errorcodetable.map(entry => entry.code)).toEqual(["parse", "method", "params", "internal", "consentrefused"]);
    for (const entry of errorcodetable) {
      expect(["never", "immediate", "afterbackoff"]).toContain(entry.retry);
      expect(entry.semantics.length).toBeGreaterThan(30);
    }
    expect(framingrules.stdio).toContain("newline");
    expect(framingrules.http).toContain("http post");
    expect(stabilityrules.additive).toContain("additive");
    expect(stabilityrules.breaking).toContain("new major protocol version");
    expect(stabilityrules.window).toContain("2.0.0");
  });

  it("enumerates the frozen message catalog with its schemas and carriers", () => {
    expect(frozenmessagecatalog.length).toBe(23);
    const schemas = new Set(frozenmessagecatalog.map(entry => entry.schema));
    expect(schemas.size).toBe(10);
    for (const entry of frozenmessagecatalog) {
      expect(entry.type).toMatch(/^[a-z]+$/);
      expect(entry.schema).toMatch(/^schemas\/[a-z]+\.schema\.json$/);
    }
  });

  it("accepts the versioned memory item envelope and refuses a foreign version", () => {
    const provenance = { origin: "https://example.com", runid: "run1", stepid: "step1", capturedat: 1 };
    const frame = memoryitemframe({ key: "k", value: 1, provenance });
    expect(frame.provenance.origin).toBe("https://example.com");
    expect(() => memoryitemframe({ version: "0.0.1", key: "k", value: 1, provenance })).toThrow("Unsupported protocol version.");
  });

  it("verifies every capmanifest matches its surface", async () => {
    if (!existsSync("dist/caps")) return; /* the capmanifest artifacts ride the build: the pass runs after pnpm build in the validate chain and the ci lanes */
    for (const surface of ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"] as const) {
      const manifest = capmanifestof(surface);
      const stored = JSON.parse(await readFile(`dist/caps/${surface}.json`, "utf8")) as { surface: string; release: string; protocolmajor: number; messages: string[]; kinds: string[]; permissions: string[]; toolversions?: Record<string, number> };
      expect(manifest.surface).toBe(stored.surface);
      expect(manifest.release).toBe(stored.release);
      expect(manifest.protocolmajor).toBe(stored.protocolmajor);
      expect(manifest.messages).toEqual(stored.messages);
      expect(manifest.kinds).toEqual(stored.kinds);
      expect(manifest.permissions).toEqual(stored.permissions);
      expect(manifest.toolversions ?? undefined).toEqual(stored.toolversions ?? undefined);
      expect(manifest.release).toBe(protocolversion);
      expect(new Set(manifest.messages).size).toBe(manifest.messages.length);
    }
  });

  it("matches the mcp capmanifest with the frozen tool catalog and its per tool versions", () => {
    const catalog = buildtoolcatalog();
    const tools = alltools(catalog);
    const manifest = capmanifestof("mcp");
    expect(manifest.messages.sort()).toEqual(tools.map(tool => tool.name).sort());
    expect(manifest.toolversions).toBeDefined();
    for (const tool of tools) {
      expect(manifest.toolversions?.[tool.name]).toBe(tool.version);
      expect(tool.version).toBeGreaterThanOrEqual(1);
    }
    expect(mcpsurfacetools.length).toBe(tools.length);
    expect(mcpsurfacekinds.every(kind => actionkindids.includes(kind as never))).toBe(true);
  });

  it("matches the manifest permissions with the capmanifest declarations", async () => {
    const manifest = JSON.parse(await readFile("web/extension/manifest.json", "utf8")) as { permissions: string[]; optional_permissions: string[]; optional_host_permissions: string[] };
    const declared = new Set([...capmanifestof("background").permissions, ...capmanifestof("sidepanel").permissions, ...capmanifestof("popup").permissions, ...capmanifestof("mcp").permissions]);
    for (const permission of [...manifest.permissions, ...manifest.optional_permissions, ...manifest.optional_host_permissions]) {
      expect(declared.has(permission)).toBe(true);
      expect(permissioncoverage[permission]).toBeDefined();
    }
    for (const [permission, coverage] of Object.entries(permissioncoverage)) {
      expect(coverage.messages.every(message => backgroundsurfacemessages.includes(message))).toBe(true);
      expect(coverage.kinds.every(kind => actionkindids.includes(kind as never))).toBe(true);
    }
  });

  it("flags capability drift between two capability manifests", () => {
    const background = capmanifestof("background");
    const widened = { ...background, messages: [...background.messages, "newmessage"], permissions: background.permissions.slice(0, -1) };
    const drift = capmanifestdiff(background, widened);
    expect(drift).toContain("added message newmessage on the background surface");
    expect(drift.some(entry => entry.startsWith("removed permission"))).toBe(true);
    const mcp = capmanifestof("mcp");
    const bumped = { ...mcp, toolversions: { ...(mcp.toolversions ?? {}), "browser.click": 3 } };
    expect(capmanifestdiff(mcp, bumped)).toContain("changed tool browser.click from version 2 to 3 on the mcp surface");
    expect(capmanifestdiff(background, { ...background })).toEqual([]);
  });

  it("keeps the frozen surface lists stable and complete", () => {
    expect(backgroundsurfacemessages.length).toBe(234);
    expect(backgroundsurfacemessages).toContain("capmanifest");
    expect(sidepanelsurfacemessages.length).toBe(168);
    expect(popupsurfacemessages.length).toBe(26);
    expect(pagebridgesurfacemessages.length).toBe(31);
    expect(clisurfacecommands).toContain("describe");
    expect(clisurfacecommands).toContain("commands");
    expect(librarysurfaceexports.length).toBeGreaterThan(3000);
    expect(librarysurfaceexports).toContain("capmanifestof");
    expect(librarysurfaceexports).toContain("parseproposal");
  });

  it("verifies the schema hash artifact stays stable", async () => {
    if (!existsSync("dist/schemas")) return; /* the schema artifacts ride the build: the pass runs after pnpm build in the validate chain and the ci lanes */
    const packagejson = JSON.parse(await readFile("package.json", "utf8")) as { version: string };
    const artifact = JSON.parse(await readFile("tests/apifreeze.json", "utf8")) as { release: string; frozezat: string; scope: string[]; sizes: Record<string, number>; hashes: Record<string, string> };
    expect(artifact.release).toBe(packagejson.version);
    expect(artifact.frozezat).toBe("2026-08-31");
    expect(artifact.scope).toEqual(["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"]);
    const schemafiles = (await readdir("dist/schemas")).filter(file => file.endsWith(".json")).sort();
    expect(schemafiles).toHaveLength(10);
    for (const file of schemafiles) {
      const digest = createHash("sha256").update(await readFile(`dist/schemas/${file}`)).digest("hex");
      expect(artifact.hashes[`schemas/${file}`]).toBe(digest);
    }
    for (const surface of artifact.scope) {
      expect(artifact.sizes[surface]).toBeGreaterThan(0);
    }
    expect(artifact.hashes["contract/actionkinds"]).toBeDefined();
    expect(artifact.hashes["contract/librarysurfaceexports"]).toBeDefined();
  });
});
