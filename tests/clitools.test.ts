import { describe, expect, it } from "vitest";
import { bundlesizeaccounting, capabilityapireport, composeworkflowdocument, csphashesof, deepmanifestchecks, exitclassofrun, exitcodeof, exportdatacontent, exportdatawindow, manifestsourceline, parseheadlessfixture, parseworkflowdocument, planlintfindings, planrisksummaryof, pngdimensions, resolvefixture, runworkflowsummaryof, secretstorerefusal, workflowauditlines } from "../cli.js";
import { headlessfixturestep, headlessprogress } from "../headless.js";
import type { headlessfixture, planfile, runlogentry, workflowrun } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one minimal png byte payload whose ihdr header declares the given dimensions. */
function pngof(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

/** Builds one reviewed plan file fixture of the example releases page. */
function planfixture(over: Partial<planfile> = {}): planfile {
  return { version: "1.1.80", goal: "Read the release notes of the example project", origin: "https://example.org", grants: ["observe", "readtext", "countelements"], steps: [
    { id: "observe", kind: "observe", label: "Observe the release page" },
    { id: "read", kind: "readtext", label: "Read the release notes text", target: "main" },
    { id: "count", kind: "countelements", label: "Count the release sections", target: "main section" },
  ], ...over };
}

/** Builds one recorded page state fixture of the example releases page. */
function fixtureof(over: Partial<headlessfixture> = {}): headlessfixture {
  return { id: "example-org-pagestate", origin: "https://example.org", grants: ["observe", "readtext", "readforms", "inspect", "countelements"], observation: {
    schemaversion: 1, url: "https://example.org/releases", title: "Example releases", textpreview: "Release notes of the example project.", textlength: 512,
    forms: [{ label: "email", type: "email", name: "email" }],
    interactive: [{ selector: "main a", role: "link", label: "latest release" }],
    capturedat: now,
  }, recordedat: now, ...over };
}

describe("cli deep manifest checks", () => {
  it("verifies every manifest key against the allowlist, the permission sources, the csp hashes, the reviewed web resources, the duplicate permissions, the chrome floor and the icon dimensions", () => {
    const manifesttext = JSON.stringify({
      manifest_version: 3, name: "devthink", version: "1.1.80", description: "The reviewed browser agent.",
      permissions: ["storage", "tabs"], optional_permissions: ["downloads", "storage"],
      content_security_policy: { extension_scripts: "script-src 'self' 'sha256-KNOWNHASH=' 'sha256-UNKNOWN='" },
      web_accessible_resources: [{ resources: ["sandbox.html"] }],
      minimum_chrome_version: 88, icons: { "16": "icon16.png" }, rogue_key: true,
    }, null, 2);
    const manifest = JSON.parse(manifesttext) as Record<string, unknown>;
    const bytes: Record<string, Uint8Array> = { "icon16.png": pngof(16, 16), "worker.js": new Uint8Array([1, 2, 3]) };
    const digestof = (payload: Uint8Array): string => payload.length === 3 ? "KNOWNHASH=" : "other";
    const checked = deepmanifestchecks({ manifest, manifesttext, manifestfile: "manifest.json", filebytes: bytes, capabilities: capabilityapireport(["storage", "tabs", "downloads"]), digestof });
    const rules = (rule: string): number => checked.findings.filter(finding => finding.rule === rule).length;
    expect(rules("manifest.key.allowlist")).toBe(1);
    expect(checked.findings.find(finding => finding.rule === "manifest.key.allowlist")?.path).toBe("rogue_key");
    expect(rules("manifest.permission.source")).toBe(4);
    expect(checked.findings.find(finding => finding.rule === "manifest.permission.source" && finding.path === "permissions.storage")?.source).toContain("manifest.json:");
    expect(rules("manifest.permission.duplicate")).toBe(1);
    expect(rules("manifest.permission.nativemessaging")).toBe(0);
    const nativerequired = deepmanifestchecks({ manifest: { manifest_version: 3, name: "devthink", version: "1.1.85", permissions: ["storage", "nativeMessaging"] }, manifesttext: JSON.stringify({ permissions: ["storage", "nativeMessaging"] }), manifestfile: "manifest.json", filebytes: {}, capabilities: capabilityapireport(["storage", "nativeMessaging"]), digestof: () => "x" });
    expect(nativerequired.findings.some(finding => finding.rule === "manifest.permission.nativemessaging" && finding.severity === "error" && finding.path === "permissions.nativeMessaging")).toBe(true);
    expect(nativerequired.exitcode).toBe(1);
    const nativeoptional = deepmanifestchecks({ manifest: { manifest_version: 3, name: "devthink", version: "1.1.85", permissions: ["storage"], optional_permissions: ["nativeMessaging"] }, manifesttext: JSON.stringify({ permissions: ["storage"], optional_permissions: ["nativeMessaging"] }), manifestfile: "manifest.json", filebytes: {}, capabilities: capabilityapireport(["storage", "nativeMessaging"]), digestof: () => "x" });
    expect(nativeoptional.findings.some(finding => finding.rule === "manifest.permission.nativemessaging" && finding.severity === "info" && finding.path === "optional_permissions.nativeMessaging")).toBe(true);
    expect(nativeoptional.exitcode).toBe(0);
    expect(rules("manifest.csp.hashes")).toBe(2);
    expect(checked.findings.some(finding => finding.rule === "manifest.csp.hashes" && finding.severity === "info" && finding.message.includes("sha256-KNOWNHASH= verifies against worker.js"))).toBe(true);
    expect(rules("manifest.war.reviewed")).toBe(0);
    expect(rules("manifest.icons")).toBe(1);
    expect(checked.findings.some(finding => finding.rule === "manifest.icons" && finding.message.includes("decodes to 16x16"))).toBe(true);
    expect(rules("manifest.chromeminimum")).toBe(0);
    expect(checked.exitcode).toBe(1);
    const floored = deepmanifestchecks({ manifest: { manifest_version: 3, name: "devthink", version: "1.1.80", permissions: ["storage"], icons: { "16": "icon16.png" }, minimum_chrome_version: 88 }, manifesttext: JSON.stringify({ permissions: ["storage"] }), manifestfile: "manifest.json", filebytes: bytes, capabilities: capabilityapireport(["storage", "sidePanel"]), digestof });
    expect(floored.findings.some(finding => finding.rule === "manifest.chromeminimum" && finding.severity === "error" && finding.message.includes("capability floor 114"))).toBe(true);
    const badicon = deepmanifestchecks({ manifest: { icons: { "16": "icon16.png" } }, manifesttext: "{}", manifestfile: "m.json", filebytes: { "icon16.png": pngof(32, 32) }, capabilities: [], digestof: () => "x" });
    expect(badicon.findings.some(finding => finding.rule === "manifest.icons" && finding.message.includes("decodes to 32x32 while its size key declares 16"))).toBe(true);
    /* the 2.0.6 fail-soft: a running tree with no bundle at all (an installed library package, an unbuilt checkout) answers the icon family through the release-zip note instead of the absent-bundle error, while a bundle that exists and misses the icon keeps the error */
    const unbundled = deepmanifestchecks({ manifest: { icons: { "16": "icons/16.png" } }, manifesttext: "{}", manifestfile: "m.json", filebytes: {}, capabilities: [], digestof: () => "x", bundlepresent: false });
    expect(unbundled.findings.some(finding => finding.rule === "manifest.icons" && finding.severity === "info" && finding.message.includes("rides the browser bundle of the release zip channel"))).toBe(true);
    expect(unbundled.exitcode).toBe(0);
    const bundledmissing = deepmanifestchecks({ manifest: { icons: { "16": "icons/16.png" } }, manifesttext: "{}", manifestfile: "m.json", filebytes: {}, capabilities: [], digestof: () => "x", bundlepresent: true });
    expect(bundledmissing.findings.some(finding => finding.rule === "manifest.icons" && finding.severity === "error" && finding.message.includes("ships no file in the bundle"))).toBe(true);
    expect(bundledmissing.exitcode).toBe(1);
    const unreviewedresource = deepmanifestchecks({ manifest: { web_accessible_resources: [{ resources: ["panel.html"] }] }, manifesttext: "{}", manifestfile: "m.json", filebytes: {}, capabilities: [], digestof: () => "x" });
    expect(unreviewedresource.findings.some(finding => finding.rule === "manifest.war.reviewed" && finding.message.includes("outside the reviewed resource set"))).toBe(true);
    expect(() => pngdimensions(new Uint8Array(8))).toThrow(/png signature/);
    expect(csphashesof("script-src 'self' 'sha256-ABC=' 'sha256-DEF='")).toEqual(["sha256-ABC=", "sha256-DEF="]);
    expect(manifestsourceline("{\n  \"storage\"\n}", "manifest.json", "\"storage\"")).toBe("manifest.json:2");
    expect(capabilityapireport(["sidePanel", "offscreen"])).toEqual([{ api: "sidePanel", minchrome: 114 }, { api: "offscreen", minchrome: 109 }]);
    expect(capabilityapireport(["nativeMessaging"])).toEqual([{ api: "nativeMessaging", minchrome: 88 }]);
  });
});

describe("cli planlint findings and risk summary", () => {
  it("accepts the reviewed plan while refusing forbidden kinds, broken selectors, missing option fields, capability misses and origins outside the consent allowlist", () => {
    const clean = planlintfindings({ file: planfixture(), capabilities: ["observe", "readtext", "countelements"], allowlist: ["https://example.org"] });
    expect(clean).toHaveLength(0);
    const broken = planlintfindings({ file: planfixture({ steps: [
      { id: "observe", kind: "observe", label: "Observe the release page" },
      { id: "forbidden", kind: "notakind", label: "A forbidden kind" },
      { id: "badtarget", kind: "readtext", label: "Broken target", target: "{not json" },
      { id: "wait", kind: "waitelement", label: "Wait without its bound", target: "main" },
    ] }), allowlist: ["https://other.example"] });
    const codes = broken.map(diagnostic => diagnostic.code);
    expect(codes).toContain("plan.kind.catalog");
    expect(codes).toContain("plan.selector.grammar");
    expect(codes).toContain("plan.options.required");
    expect(codes).toContain("plan.origin.allowlist");
    expect(broken.find(diagnostic => diagnostic.code === "plan.options.required")?.message).toContain("waitelement misses the required option field wait");
    const bounded = planlintfindings({ file: planfixture({ steps: [{ id: "wait", kind: "waitelement", label: "Wait for the list", target: "main", options: "{\"wait\":5000}" }] }) });
    expect(bounded).toHaveLength(0);
    const capped = planlintfindings({ file: planfixture(), capabilities: ["observe"] });
    expect(capped.filter(diagnostic => diagnostic.code === "plan.capability.catalog")).toHaveLength(2);
    const risk = planrisksummaryof(planfixture());
    expect(risk).toMatchObject({ read: 3, interaction: 0, sensitive: 0, steps: 3 });
    const mixed = planrisksummaryof(planfixture({ steps: [
      { id: "observe", kind: "observe", label: "Observe" },
      { id: "scroll", kind: "scroll", label: "Scroll the release list", target: "main" },
      { id: "pay", kind: "confirmpay", label: "Confirm the payment", gate: true },
    ] }));
    expect(mixed).toMatchObject({ read: 1, interaction: 1, sensitive: 1, steps: 3 });
  });
});

describe("cli runworkflow document, summary and audit trail", () => {
  it("parses the workflow document under schemastrict, composes it through the shared engine and maps the run states onto the documented exit codes", () => {
    const document = parseworkflowdocument({ version: "1.1.80", workflow: { name: "changelog digest", version: 1, origins: ["https://example.org"], steps: [
      { id: "observe", kind: "observe", label: "Observe the changelog page" },
      { id: "read", kind: "readtext", label: "Read the changelog text", target: "main" },
    ] } });
    expect(document.workflow.name).toBe("changelog digest");
    expect(document.workflow.steps).toHaveLength(2);
    const record = composeworkflowdocument(document, now);
    expect(record.steps.map(step => step.id)).toEqual(["observe", "read"]);
    expect(() => parseworkflowdocument({ version: "1.1.80", workflow: { name: "x", version: 1, origins: ["http://insecure.example"], steps: [{ id: "s", kind: "observe", label: "l" }] } })).toThrow(/HTTPS origin/);
    expect(() => parseworkflowdocument({ version: "1.1.80", rogue: true })).toThrow(/unknown field rogue/);
    const run: workflowrun = { id: "run1", workflowid: record.id, state: "done", cursor: 2, startedat: now, endedat: now + 500 };
    const log: runlogentry[] = [
      { stepid: "observe", label: "Observe the changelog page", state: "done", startedat: now, duration: 100, summary: "The recorded page carried 512 text characters." },
      { stepid: "read", label: "Read the changelog text", state: "done", startedat: now + 100, duration: 400, summary: "The text read the changelog." },
    ];
    const summary = runworkflowsummaryof({ runid: run.id, run, log });
    expect(summary.exitclass).toBe("ok");
    expect(summary.exitcode).toBe(0);
    expect(summary.checkpoint).toBe(2);
    expect(summary.steps).toHaveLength(2);
    expect(summary.steps[1]?.duration).toBe(400);
    const failed = runworkflowsummaryof({ runid: run.id, run: { ...run, state: "failed", failreason: "The changelog list never appeared." }, log });
    expect(failed.exitclass).toBe("stepfailed");
    expect(failed.exitcode).toBe(2);
    expect(failed.reason).toContain("never appeared");
    const cancelled = runworkflowsummaryof({ runid: run.id, run: { ...run, state: "cancelled", cancelreason: "The operator cancelled the replay." }, log });
    expect(cancelled.exitclass).toBe("cancelled");
    expect(exitclassofrun({ ...run, state: "paused" })).toBe("schemaerror");
    expect(exitcodeof("consentrefused")).toBe(1);
    expect(exitcodeof("unsupported")).toBe(4);
    expect(() => exitcodeof("mystery")).toThrow(/outside the documented classes/);
    const audit = workflowauditlines({ runid: run.id, workflow: record.id, log, now: now + 600 });
    const lines = audit.split("\n");
    expect(lines).toHaveLength(3);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({ runid: "run1", workflow: record.id, state: "sealed" });
    expect(JSON.parse(lines[1] ?? "{}").stepid).toBe("observe");
  });
});

describe("cli exportdata windows, formats and secret refusal", () => {
  it("filters the records through the from and to window while the shared serializers emit json, csv and markdown and the secret store material refuses the export in full", () => {
    const records: Array<Record<string, unknown>> = [
      { at: now - 5000, url: "https://example.org/a", title: "alpha" },
      { at: now, url: "https://example.org/b", title: "beta" },
      { at: now + 5000, url: "https://example.org/c", title: "gamma" },
      { url: "https://example.org/undated", title: "undated" },
    ];
    const windowed = exportdatawindow(records, now - 1000, now + 1000);
    expect(windowed.map(record => record.title)).toEqual(["beta", "undated"]);
    expect(exportdatawindow(records, undefined, now - 1000).map(record => record.title)).toEqual(["alpha", "undated"]);
    const jsonexport = exportdatacontent({ scope: "session", format: "json", records: records.slice(0, 2), shapes: [] });
    expect(jsonexport.result.rows).toBe(2);
    expect(jsonexport.result.bytes).toBe(jsonexport.content.length);
    expect(jsonexport.result.path).toBeUndefined();
    expect(JSON.parse(jsonexport.content)).toHaveLength(2);
    const jsonl = exportdatacontent({ scope: "audit", format: "jsonl", records: records.slice(0, 2), shapes: [] });
    expect(jsonl.content.split("\n")).toHaveLength(2);
    const csvexport = exportdatacontent({ scope: "extraction", format: "csv", records: [{ title: "alpha", at: now }], shapes: [], path: "out.csv" });
    expect(csvexport.content.split("\n")[0]).toBe("at,title");
    expect(csvexport.result.path).toBe("out.csv");
    const markdown = exportdatacontent({ scope: "extraction", format: "markdown", records: [{ title: "alpha", at: now }], shapes: [] });
    expect(markdown.content).toContain("| at | title |");
    const vaultrefusal = secretstorerefusal([{ vaultid: "v1", title: "x" }, { apitoken: "ghp_rawtoken" }]);
    expect(vaultrefusal.refused).toBe(true);
    expect(vaultrefusal.fields).toEqual(["apitoken", "vaultid"]);
    expect(vaultrefusal.reason).toContain("never ships through an export");
    expect(secretstorerefusal([{ apitoken: "value [redacted] by the mask" }]).refused).toBe(false);
    const refusedexport = exportdatacontent({ scope: "session", format: "json", records: [{ vaultid: "v1" }], shapes: [] });
    expect(refusedexport.result.bytes).toBe(0);
    expect(refusedexport.result.rows).toBe(0);
    expect(refusedexport.result.reason).toContain("refuses the secret store material");
    expect(refusedexport.content).toBe("");
  });
});

describe("cli headlessmode fixture replay", () => {
  it("parses the recorded page state under schemastrict while the consent gate serves the granted read only vocabulary, refuses the wider kinds and reports the kinds a fixture cannot satisfy", () => {
    const fixture = fixtureof();
    const parsed = parseheadlessfixture({ id: fixture.id, origin: fixture.origin, grants: fixture.grants, observation: fixture.observation, recordedat: fixture.recordedat });
    expect(parsed.origin).toBe("https://example.org");
    expect(() => parseheadlessfixture({ id: fixture.id, origin: "http://insecure.example", observation: fixture.observation, grants: [], recordedat: now })).toThrow(/HTTPS origin/);
    expect(() => parseheadlessfixture({ id: fixture.id, origin: fixture.origin, observation: { schemaversion: 1 }, grants: [], recordedat: now })).toThrow(/misses its/);
    expect(() => parseheadlessfixture({ id: fixture.id, origin: fixture.origin, observation: fixture.observation, grants: [], recordedat: now, extra: true })).toThrow(/unknown field extra/);
    expect(resolvefixture([fixture], "https://example.org").id).toBe(fixture.id);
    expect(() => resolvefixture([fixture], "https://other.example")).toThrow(/No recorded fixture covers the origin/);
    const observed = headlessfixturestep(fixture, { id: "observe", kind: "observe", label: "Observe the release page" });
    expect(observed.state).toBe("done");
    expect(observed.summary).toContain("512 text characters");
    const counted = headlessfixturestep(fixture, { id: "count", kind: "countelements", label: "Count the release sections", target: "main section" });
    expect(counted.state).toBe("done");
    expect((counted.details as { count: number } | undefined)?.count).toBe(1);
    const formread = headlessfixturestep(fixture, { id: "forms", kind: "readforms", label: "Read the release form" });
    expect(formread.state).toBe("done");
    const wider = headlessfixturestep({ ...fixture, grants: ["hover"] }, { id: "hover", kind: "hover", label: "Hover the release link" });
    expect(wider.state).toBe("refused");
    expect(wider.summary).toContain("grades interaction");
    const unprojected = headlessfixturestep({ ...fixture, grants: [...fixture.grants, "wait"] }, { id: "wait", kind: "wait", label: "Wait for the quiet page" });
    expect(unprojected.state).toBe("unsupported");
    expect(unprojected.summary).toContain("no projection for it");
    const progress = headlessprogress({ progress: undefined, planid: "plan1", step: { id: "observe", kind: "observe", label: "Observe the release page" }, outcome: observed, now });
    expect((progress.outcomes ?? [])).toHaveLength(1);
    expect(progress.outcomes?.[0]?.ok).toBe(true);
  });
});

describe("cli bundle size accounting and library entries", () => {
  it("grades the dist targets against their size budgets so a bundle that outgrows its budget fails the build before it ships", () => {
    const ok = bundlesizeaccounting([{ target: "cli", bytes: 480_000 }, { target: "headless", bytes: 690_000 }]);
    expect(ok.ok).toBe(true);
    expect(ok.over).toHaveLength(0);
    const over = bundlesizeaccounting([{ target: "cli", bytes: 700_000 }, { target: "headless", bytes: 480_000 }, { target: "worker", bytes: 9_000_000 }]);
    expect(over.ok).toBe(false);
    expect(over.over).toEqual([{ target: "cli", bytes: 700_000, budget: 600_000 }]);
    expect(over.reason).toContain("cli=700000b>600000b");
  });
});
