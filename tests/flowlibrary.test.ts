import { describe, expect, it } from "vitest";
import { exportlibrarymanifests, forklibrary, grantdiffof, installlibrary, librarybrowserow, libraryentryof, libraryeventof, libraryproposalof, librarysearch, librarystepsview, manifestdigest, removelibrary, sensitiveconsentfor, signmanifest, updatelibrary, validatemanifest, verifypublishersignature } from "../flow.js";
import { librarycapabilitygate, librarygrantgate, libraryimportgate, librarymanifestgate, libraryquarantinegate, librarysensitivegate } from "../policy.js";
import type { flowlibrarymanifest } from "../types.js";

const now = 1_800_000_000_000;
const capabilities = ["focus", "inspect", "click", "type", "scroll", "select", "hover"];

function manifest(overrides: Partial<flowlibrarymanifest> = {}): flowlibrarymanifest {
  return {
    id: "invoice-digest",
    title: "Invoice digest",
    description: "Reads the invoice table and exports a digest.",
    version: "1.0.0",
    publisher: "example publisher",
    registry: "https://registry.example.test",
    steps: [
      { id: "open", kind: "focus", label: "Focus the table", target: "#invoices", namespace: "main" },
      { id: "read", kind: "inspect", label: "Inspect the rows" },
    ],
    kinds: ["focus", "inspect"],
    requiredgrants: ["https://example.com"],
    dataexpectations: [{ stepid: "read", family: "text content", fields: ["invoice number", "total"] }],
    sensitive: false,
    ...overrides,
  };
}

describe("flowlibrary manifest validation", () => {
  it("validates a manifest under schemastrict and refuses shape errors with their paths", async () => {
    const result = await validatemanifest({ manifest: manifest(), capabilities });
    expect(result.ok).toBe(true);
    expect(result.reason).toMatch(/schemastrict/);
    const broken = await validatemanifest({ manifest: { ...manifest(), title: " " }, capabilities });
    expect(broken.ok).toBe(false);
    expect(broken.errors.some(error => error.path === "title")).toBe(true);
    expect(librarymanifestgate({ errors: broken.errors }).allowed).toBe(false);
    const unknownfield = await validatemanifest({ manifest: { ...manifest(), extra: "field" }, capabilities });
    expect(unknownfield.ok).toBe(false);
    expect(unknownfield.errors.some(error => error.path === "extra")).toBe(true);
    const notanobject = await validatemanifest({ manifest: "nope", capabilities });
    expect(notanobject.ok).toBe(false);
  });

  it("refuses kinds that exceed the installed capability set", async () => {
    const result = await validatemanifest({ manifest: manifest({ steps: [{ id: "pay", kind: "payinvoice", label: "Pay" }], kinds: ["payinvoice"] }), capabilities });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/capability set lacks/);
    expect(librarycapabilitygate({ kinds: ["payinvoice"], capabilities: capabilities }).allowed).toBe(false);
    expect(librarycapabilitygate({ kinds: ["click"], capabilities }).allowed).toBe(true);
  });

  it("verifies publisher signatures over the manifest digest and refuses any other body", async () => {
    const signed = { ...manifest(), publish: await signmanifest(manifest(), "registry.example.test publish", now) };
    const verification = await verifypublishersignature(signed);
    expect(verification.verified).toBe(true);
    expect(verification.reason).toMatch(/verifies/);
    const tampered = { ...signed, description: "a different body" };
    expect((await verifypublishersignature(tampered)).verified).toBe(false);
    expect((await verifypublishersignature(manifest())).verified).toBe(false);
  });

  it("quarantines entries from unverified publishers while verified entries stay available", async () => {
    const unsigned = await libraryentryof({ manifest: manifest(), provenance: "a local file", now });
    expect(unsigned.state).toBe("quarantined");
    expect(libraryquarantinegate({ verified: false, signaturepresent: false, signaturevalid: false }).allowed).toBe(false);
    const signedmanifest = { ...manifest(), publish: await signmanifest(manifest(), "registry.example.test publish", now) };
    const verified = await libraryentryof({ manifest: signedmanifest, provenance: "the registry", now });
    expect(verified.state).toBe("available");
    expect(libraryquarantinegate({ verified: true, signaturepresent: true, signaturevalid: true }).allowed).toBe(true);
    expect(libraryquarantinegate({ verified: false, signaturepresent: true, signaturevalid: false }).allowed).toBe(false);
  });

  it("requires a fresh consent for sensitive manifests only", () => {
    expect(sensitiveconsentfor(manifest(), false).required).toBe(false);
    expect(librarysensitivegate({ sensitive: false, freshconsent: false }).allowed).toBe(true);
    expect(librarysensitivegate({ sensitive: true, freshconsent: false }).allowed).toBe(false);
    expect(sensitiveconsentfor(manifest({ sensitive: true }), true).reason).toMatch(/fresh consent/);
    expect(librarysensitivegate({ sensitive: true, freshconsent: true }).allowed).toBe(true);
  });

  it("surfaces the grant diff and maps the required grants onto originprofiles", () => {
    const diff = grantdiffof({ manifest: manifest({ requiredgrants: ["https://example.com", "https://other.test"] }), heldgrants: ["https://example.com"] });
    expect(diff.added).toEqual(["https://other.test"]);
    expect(diff.kept).toEqual(["https://example.com"]);
    expect(diff.originmappings).toHaveLength(2);
    expect(diff.originmappings[0]?.kinds).toContain("focus");
    expect(librarygrantgate({ requiredgrants: ["https://other.test"], heldgrants: ["https://example.com"] }).allowed).toBe(false);
    expect(librarygrantgate({ requiredgrants: ["https://example.com"], heldgrants: ["https://example.com"] }).allowed).toBe(true);
  });

  it("lands every import as a proposal that still passes the plan review", () => {
    const entry = { id: "invoice-digest@1.0.0", manifest: manifest(), digest: "d".repeat(64), state: "available" as const, provenance: "test", addedat: now };
    const proposal = libraryproposalof(entry);
    expect(proposal.objective).toMatch(/Invoice digest/);
    expect(libraryimportgate({ proposal: true, planreviewed: true }).allowed).toBe(true);
    expect(libraryimportgate({ proposal: false, planreviewed: true }).allowed).toBe(false);
    expect(libraryimportgate({ proposal: true, planreviewed: false }).allowed).toBe(false);
  });
});

describe("flowlibrary install, update, fork and removal", () => {
  it("resolves a manifest into a pending workflow record and rewrites selector namespaces", async () => {
    const entry = await libraryentryof({ manifest: manifest(), provenance: "test", now });
    const record = installlibrary({ entry, selectornamespace: "#app", now });
    expect(record.id).toBe("library:invoice-digest:1.0.0");
    expect(record.reviewstate).toBe("pending");
    expect(record.origins).toEqual(["https://example.com"]);
    expect(record.steps[0]?.target).toBe("#app #invoices");
    expect(record.steps[1]?.target).toBeUndefined();
    const plain = installlibrary({ entry, now });
    expect(plain.steps[0]?.target).toBe("#invoices");
  });

  it("diffs versions before an update replaces a local entry", async () => {
    const existing = await libraryentryof({ manifest: manifest(), provenance: "test", now });
    const same = await libraryentryof({ manifest: manifest(), provenance: "test", now });
    expect(updatelibrary({ incoming: same, existing }).replace).toBe(false);
    const changed = await libraryentryof({ manifest: manifest({ version: "2.0.0", requiredgrants: ["https://example.com", "https://new.test"], steps: [...manifest().steps, { id: "scroll", kind: "scroll", label: "Scroll" }] }), provenance: "test", now });
    const diff = updatelibrary({ incoming: changed, existing });
    expect(diff.replace).toBe(true);
    expect(diff.versionfrom).toBe("1.0.0");
    expect(diff.versionto).toBe("2.0.0");
    expect(diff.changedsteps).toContain("scroll");
    expect(diff.addedgrants).toEqual(["https://new.test"]);
  });

  it("keeps local forks untouched on removal and forks create independent workflows", async () => {
    const entry = await libraryentryof({ manifest: manifest(), provenance: "test", now });
    const fork = forklibrary({ entry, now });
    expect(fork.id.startsWith("fork:invoice-digest:")).toBe(true);
    expect(fork.name).toBe("Invoice digest fork");
    expect(fork.reviewstate).toBe("pending");
    const outcome = removelibrary({ entry, forks: [fork] });
    expect(outcome.removed).toBe(entry.id);
    expect(outcome.keptforks).toEqual([fork.id]);
    expect(outcome.reason).toMatch(/stay untouched/);
  });

  it("searches the library and renders browser rows, step views and audit exports", async () => {
    const a = await libraryentryof({ manifest: manifest(), provenance: "test", now });
    const b = await libraryentryof({ manifest: manifest({ id: "other", title: "Other flow", publisher: "second publisher", sensitive: true }), provenance: "test", now });
    expect(librarysearch({ entries: [a, b], query: "other flow" })).toHaveLength(1);
    expect(librarysearch({ entries: [a, b], filter: { publisher: "second publisher" } })).toHaveLength(1);
    expect(librarysearch({ entries: [a, b] })).toHaveLength(2);
    const row = librarybrowserow(a);
    expect(row.publisher).toBe("example publisher");
    expect(row.grants).toEqual(["https://example.com"]);
    const steps = librarystepsview(a);
    expect(steps).toHaveLength(2);
    expect(steps[1]?.fields).toEqual(["invoice number", "total"]);
    const events = libraryeventof({ kind: "install", entryid: a.id, title: a.manifest.title, version: a.manifest.version, detail: "installed", now });
    expect(events.kind).toBe("install");
    expect(() => libraryeventof({ kind: "install", entryid: " ", title: "", version: "", detail: "", now })).toThrow(/entry id/);
    const exported = exportlibrarymanifests([a, b]);
    expect(exported).toHaveLength(2);
    expect(exported[0]?.digest).toBe(a.digest);
    expect(await manifestdigest(a.manifest)).not.toBe(await manifestdigest(b.manifest));
  });

  it("deduplicates entries by manifest digest in the memory store semantics", async () => {
    const a = await libraryentryof({ manifest: manifest(), provenance: "test", now });
    const duplicate = await libraryentryof({ manifest: manifest(), provenance: "second import", now });
    expect(a.digest).toBe(duplicate.digest);
    const store = [a];
    const deduped = [duplicate, ...store.filter(candidate => candidate.digest !== duplicate.digest)];
    expect(deduped).toHaveLength(1);
    expect(deduped[0]?.provenance).toBe("second import; The manifest invoice-digest of example publisher carries no publisher signature; the entry quarantines until the user verifies its publisher.");
  });
});
