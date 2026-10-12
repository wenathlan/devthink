import { describe, expect, it } from "vitest";
import {
  conflictsfor,
  fileproviderof,
  resolveconflict,
  syncbridgeexportpayload,
  syncbridgehookof,
  syncbridgeoptinflip,
  syncbridgeproviders,
  syncbridgescan,
  syncbridgevalidate,
  syncdigestof,
  webproviderstub,
} from "../flow.js";
import { syncbridgeoptingate, syncbridgescopegate } from "../policy.js";
import type { flowlibrarymanifest, syncbridgeconflict, syncbridgehook } from "../types.js";

const now = 1_800_000_000_000;

function manifest(id: string, version: string): flowlibrarymanifest {
  return {
    id,
    title: `Flow ${id}`,
    description: "A shared template.",
    version,
    publisher: "example publisher",
    steps: [{ id: "open", kind: "focus", label: "Focus" }],
    kinds: ["focus"],
    requiredgrants: ["https://example.com"],
    dataexpectations: [],
    sensitive: false,
  };
}

function hook(overrides: Partial<syncbridgehook> = {}): syncbridgehook {
  return {
    id: "sync:file:1",
    provider: "file",
    direction: "both",
    optin: false,
    endpoint: "manifests.json",
    state: "idle",
    createdat: now,
    ...overrides,
  };
}

describe("syncbridge hooks and opt in gating", () => {
  it("creates hooks opted out with no default on", () => {
    const created = syncbridgehookof({ provider: "file", direction: "both", endpoint: "manifests.json", now });
    expect(created.optin).toBe(false);
    expect(created.state).toBe("idle");
    expect(() => syncbridgehookof({ provider: "file", direction: "both", endpoint: " ", now })).toThrow(/hardcoded/);
    expect(syncbridgeoptingate({ optin: false }).allowed).toBe(false);
    expect(syncbridgeoptingate({ optin: false }).reason).toMatch(/no hook ever defaults on/);
    expect(syncbridgeoptingate({ optin: true }).allowed).toBe(true);
  });

  it("flips the explicit opt in and lists the providers", () => {
    const created = syncbridgehookof({
      provider: "web",
      direction: "pull",
      endpoint: "https://registry.example.test",
      now,
    });
    const opted = syncbridgeoptinflip(created, true);
    expect(opted.optin).toBe(true);
    expect(syncbridgeoptinflip(opted, false).optin).toBe(false);
    const providers = syncbridgeproviders();
    expect(providers.map((provider) => provider.provider)).toEqual(["file", "web"]);
    expect(providers[1]?.note).toMatch(/stub/);
  });

  it("keeps the bridge on manifests only and refuses secrets and logs in full", () => {
    expect(
      syncbridgevalidate({ kind: "syncbridge", manifests: [manifest("a", "1")], digests: [], exclusions: [] }).ok,
    ).toBe(true);
    expect(
      syncbridgevalidate({
        kind: "syncbridge",
        manifests: [{ ...manifest("a", "1"), apikey: "sk-live" } as unknown as Record<string, unknown>] as unknown,
      }).ok,
    ).toBe(false);
    expect(syncbridgevalidate({ kind: "syncbridge", manifests: [], secrets: ["hunter2"] }).ok).toBe(false);
    expect(syncbridgevalidate({ kind: "syncbridge", manifests: [], logs: [{ summary: "typed hunter2" }] }).ok).toBe(
      false,
    );
    expect(syncbridgevalidate({ kind: "other", manifests: [] }).ok).toBe(false);
    expect(syncbridgescopegate({ carriessecrets: true, carrieslogs: false }).allowed).toBe(false);
    expect(syncbridgescopegate({ carriessecrets: false, carrieslogs: true }).allowed).toBe(false);
    expect(syncbridgescopegate({ carriessecrets: false, carrieslogs: false }).allowed).toBe(true);
  });
});

describe("syncbridge digests and conflict detection", () => {
  it("computes manifest digests and moves only matching manifests", async () => {
    const active = hook({ optin: true });
    const localmanifest = manifest("digest", "1.0.0");
    const digest = await syncdigestof(localmanifest);
    expect(digest).toHaveLength(64);
    const scan = await syncbridgescan({
      hook: active,
      local: [{ manifestid: "digest", version: "1.0.0", digest }],
      remote: [{ manifestid: "digest", version: "1.0.0", digest }],
      now,
    });
    expect(scan.conflicts).toHaveLength(0);
    expect(scan.synced).toEqual(["digest"]);
    expect(scan.reason).toMatch(/moved/);
  });

  it("surfaces both versions on digest conflicts instead of a silent overwrite", async () => {
    const active = hook({ optin: true });
    const scan = await syncbridgescan({
      hook: active,
      local: [{ manifestid: "flow", version: "1.0.0", digest: "a".repeat(64) }],
      remote: [{ manifestid: "flow", version: "2.0.0", digest: "b".repeat(64) }],
      now,
    });
    expect(scan.synced).toHaveLength(0);
    expect(scan.conflicts).toHaveLength(1);
    expect(scan.conflicts[0]?.local.version).toBe("1.0.0");
    expect(scan.conflicts[0]?.remote.version).toBe("2.0.0");
    expect(scan.reason).toMatch(/instead of a silent overwrite/);
    const conflict: syncbridgeconflict = {
      id: scan.conflicts[0]?.id ?? "c",
      hookid: active.id,
      manifestid: "flow",
      local: { digest: "a".repeat(64), version: "1.0.0" },
      remote: { digest: "b".repeat(64), version: "2.0.0" },
      detectedat: now,
    };
    const resolved = resolveconflict(conflict, "remote", now);
    expect(resolved.resolution).toBe("remote");
    expect(resolved.resolvedat).toBe(now);
    expect(() => resolveconflict(resolved, "local", now)).toThrow(/exactly once/);
    expect(conflictsfor([conflict, { ...conflict, id: "c2", hookid: "other" }], active.id)).toHaveLength(1);
  });

  it("refuses to scan or push behind an opted out hook", async () => {
    const off = hook({ optin: false });
    const scan = await syncbridgescan({
      hook: off,
      local: [],
      remote: [{ manifestid: "flow", version: "1.0.0", digest: "a".repeat(64) }],
      now,
    });
    expect(scan.synced).toHaveLength(0);
    expect(scan.reason).toMatch(/no explicit opt in/);
  });

  it("exports and describes the file and web providers", async () => {
    const payload = await syncbridgeexportpayload([manifest("a", "1.0.0"), manifest("b", "1.0.0")]);
    expect(payload.kind).toBe("syncbridge");
    expect(payload.manifests).toHaveLength(2);
    expect(payload.digests).toHaveLength(2);
    expect(payload.exclusions).toEqual(["secretvault values", "logs"]);
    const file = fileproviderof(hook());
    expect(file.operations.map((operation) => operation.kind)).toEqual(["pull", "push", "list"]);
    const stub = webproviderstub(hook({ provider: "web", optin: true, endpoint: "https://registry.example.test" }));
    expect(stub.stub).toBe(true);
    expect(stub.reason).toMatch(/stub/);
  });
});
