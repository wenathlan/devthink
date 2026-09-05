import { describe, expect, it } from "vitest";
import { inmemoryvault, secretleakscan, secretshapecarrying, vaultcovers, vaultdelete, vaultdigestof, vaultentryof, vaultprompttext, vaultstore, vaultvaluefor, vaultview } from "../security.js";

const now = 1_800_000_000_000;

describe("secretvault", () => {
  it("stores secrets behind the vault seam while only metadata persists", async () => {
    const seam = inmemoryvault();
    const entry = await vaultstore({ seam, label: "Bank login", scope: "https://bank.example", profileid: "profile", provenance: "user", value: "hunter2", now });
    expect(entry.label).toBe("Bank login");
    expect(entry.scope).toBe("https://bank.example");
    expect(entry.algorithm).toBe("sha-256");
    expect(entry.digest.startsWith("sha256:")).toBe(true);
    expect(JSON.stringify(entry)).not.toContain("hunter2");
    const value = await vaultvaluefor({ seam, entry });
    expect(value.ok).toBe(true);
    expect(value.value).toBe("hunter2");
    expect(value.reason).toMatch(/last possible moment/);
  });

  it("derives the sha-256 verification digest of a value so no plaintext persists", async () => {
    const digest = await vaultdigestof("token-value");
    expect(digest.startsWith("sha256:")).toBe(true);
    expect(digest.length).toBe("sha256:".length + 64);
    expect(await vaultdigestof("token-value")).toBe(digest);
    expect(await vaultdigestof("other")).not.toBe(digest);
  });

  it("refuses vault records without a label, a scope or a digest", () => {
    expect(() => vaultentryof({ label: "  ", scope: "https://bank.example", profileid: "p", provenance: "user", digest: "sha256:abc", now })).toThrow(/label/);
    expect(() => vaultentryof({ label: "Bank", scope: "", profileid: "p", provenance: "user", digest: "sha256:abc", now })).toThrow(/scope/);
    expect(() => vaultentryof({ label: "Bank", scope: "https://bank.example", profileid: "p", provenance: "user", digest: "raw", now })).toThrow(/digest/);
  });

  it("drops a secret from the seam so no value and no copy remains", async () => {
    const seam = inmemoryvault();
    const entry = await vaultstore({ seam, label: "Api key", scope: "https://api.example", profileid: "p", provenance: "session", value: "secret-value", now });
    const dropped = await vaultdelete({ seam, entry });
    expect(dropped.dropped).toBe(true);
    expect(dropped.reason).toMatch(/no value and no copy remains/);
    const missing = await vaultvaluefor({ seam, entry });
    expect(missing.ok).toBe(false);
    expect(missing.reason).toMatch(/holds no value/);
  });

  it("scopes every vault record to exactly one origin", () => {
    const entry = { vaultid: "v", label: "Bank", scope: "https://bank.example", profileid: "p", provenance: "user" as const, algorithm: "sha-256" as const, digest: "sha256:abc", createdat: now };
    expect(vaultcovers(entry, "https://bank.example")).toBe(true);
    expect(vaultcovers(entry, "https://lookalike.bank.example")).toBe(false);
    expect(vaultcovers(entry, "https://other.example")).toBe(false);
  });

  it("refuses secrets that leaked into step options, variables and plan texts", async () => {
    const seam = inmemoryvault();
    const entry = await vaultstore({ seam, label: "Bank login", scope: "https://bank.example", profileid: "p", provenance: "user", value: "hunter2", now });
    const leaked = await secretleakscan({ candidates: ["plain text", "hunter2", ""], entries: [entry] });
    expect(leaked.leaks).toEqual(["hunter2"]);
    expect(leaked.reason).toMatch(/never ride step options/);
    const clean = await secretleakscan({ candidates: ["plain text"], entries: [entry] });
    expect(clean.leaks).toEqual([]);
    expect(clean.reason).toMatch(/no leaked secret/);
  });

  it("refuses raw typed values behind masked field shapes in step options", () => {
    const carrying = secretshapecarrying({ kind: "fillform", target: "#login", options: JSON.stringify({ fields: [{ name: "password", value: "hunter2" }] }) });
    expect(carrying.carries).toBe(true);
    expect(carrying.reason).toMatch(/vault at the last possible moment/);
    const clean = secretshapecarrying({ kind: "fillform", target: "#login", options: JSON.stringify({ fields: [{ name: "username", value: "anna" }] }) });
    expect(clean.carries).toBe(false);
    const rawoption = secretshapecarrying({ kind: "type", target: "#card", value: "4242" });
    expect(rawoption.carries).toBe(false);
  });

  it("serves the vault view with labels and scopes only", () => {
    const entry = { vaultid: "v", label: "Bank login", scope: "https://bank.example", profileid: "p", provenance: "user" as const, algorithm: "sha-256" as const, digest: "sha256:abc", createdat: now, lastusedat: now + 5 };
    const view = vaultview([entry]);
    expect(view).toEqual([{ vaultid: "v", label: "Bank login", scope: "https://bank.example", provenance: "user", createdat: now, lastusedat: now + 5 }]);
    expect(JSON.stringify(view)).not.toContain("sha256:abc");
  });

  it("prompts with the credential label only and never the value", () => {
    const entry = { vaultid: "v", label: "Bank login", scope: "https://bank.example", profileid: "p", provenance: "user" as const, algorithm: "sha-256" as const, digest: "sha256:abc", createdat: now };
    const prompt = vaultprompttext(entry, "https://bank.example");
    expect(prompt).toContain("Bank login");
    expect(prompt).toMatch(/value stays behind the vault/);
  });
});
