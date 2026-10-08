// # mcpregistry.test — the opt-in automation address book: the safeurl
// boundary, the CRUD over the injected storage, the opt-in default and the
// honest refusals.
import { describe, expect, it } from "vitest";
import { createmcpregistry, memorystorage, safeurl } from "../mcpregistry.js";

describe("safeurl", () => {
  it("accepts public http and https urls", () => {
    expect(safeurl("https://mcp.example.com")).toBe(true);
    expect(safeurl("https://mcp.example.com/v1/tools")).toBe(true);
    expect(safeurl("http://api.devthink.pro")).toBe(true);
    expect(safeurl("  https://gateway.example.org  ")).toBe(true);
  });

  it("refuses localhost and the loopback literals", () => {
    expect(safeurl("http://localhost")).toBe(false);
    expect(safeurl("http://localhost:3000")).toBe(false);
    expect(safeurl("http://web.localhost")).toBe(false);
    expect(safeurl("http://127.0.0.1")).toBe(false);
    expect(safeurl("http://[::1]")).toBe(false);
    expect(safeurl("http://0.0.0.0")).toBe(false);
  });

  it("refuses the private and reserved ranges", () => {
    expect(safeurl("http://10.0.0.1")).toBe(false);
    expect(safeurl("http://172.16.0.1")).toBe(false);
    expect(safeurl("http://172.31.255.255")).toBe(false);
    expect(safeurl("http://192.168.1.1")).toBe(false);
    expect(safeurl("http://169.254.0.1")).toBe(false);
    expect(safeurl("http://[fc00::1]")).toBe(false);
    expect(safeurl("http://[fd12::1]")).toBe(false);
    expect(safeurl("http://[fe80::1]")).toBe(false);
  });

  it("refuses schemes the boundary never carries and garbage", () => {
    expect(safeurl("ftp://mcp.example.com")).toBe(false);
    expect(safeurl("file:///etc/hosts")).toBe(false);
    expect(safeurl("")).toBe(false);
    expect(safeurl("not a url")).toBe(false);
  });
});

describe("mcp registry endpoints", () => {
  it("adds an endpoint opt-in off and lists a copy of it", () => {
    const registry = createmcpregistry(memorystorage());
    const answer = registry.addendpoint({ label: "the family mcp", url: "https://mcp.example.com" });
    expect(answer.ok).toBe(true);
    expect(answer.row?.enabled).toBe(false);
    const rows = registry.listendpoints();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.label).toBe("the family mcp");
    expect(rows[0]?.enabled).toBe(false);
    rows[0].enabled = true;
    expect(registry.listendpoints()[0]?.enabled).toBe(false);
  });

  it("refuses an endpoint whose url the boundary closes", () => {
    const registry = createmcpregistry(memorystorage());
    expect(registry.addendpoint({ label: "local", url: "http://localhost:8080" }).ok).toBe(false);
    expect(registry.addendpoint({ label: "lan", url: "http://192.168.0.10" }).ok).toBe(false);
    expect(registry.addendpoint({ label: "no label", url: "  " }).ok).toBe(false);
    expect(registry.listendpoints()).toHaveLength(0);
  });

  it("updates the opt-in toggle, the label and the url, and refuses a closed url", () => {
    const registry = createmcpregistry(memorystorage());
    const added = registry.addendpoint({ label: "the family mcp", url: "https://mcp.example.com" });
    const id = added.row?.id ?? "";
    expect(registry.updateendpoint(id, { enabled: true }).row?.enabled).toBe(true);
    expect(registry.updateendpoint(id, { label: "  renamed  " }).row?.label).toBe("renamed");
    expect(registry.updateendpoint(id, { url: "https://mcp2.example.com" }).row?.url).toBe("https://mcp2.example.com");
    expect(registry.updateendpoint(id, { url: "http://10.1.2.3" }).ok).toBe(false);
    expect(registry.listendpoints()[0]?.url).toBe("https://mcp2.example.com");
    expect(registry.updateendpoint("mcp.endpoint.missing", { enabled: true }).ok).toBe(false);
  });

  it("removes an endpoint and answers honestly for an unknown id", () => {
    const registry = createmcpregistry(memorystorage());
    const added = registry.addendpoint({ label: "the family mcp", url: "https://mcp.example.com" });
    const id = added.row?.id ?? "";
    expect(registry.removeendpoint(id).ok).toBe(true);
    expect(registry.listendpoints()).toHaveLength(0);
    expect(registry.removeendpoint(id).ok).toBe(false);
  });
});

describe("mcp registry providers", () => {
  it("adds a custom provider opt-in off with the credential name, never a secret", () => {
    const registry = createmcpregistry(memorystorage());
    const answer = registry.addprovider({
      label: "the custom llm",
      baseUrl: "https://api.example.com/v1",
      keyref: "customllm.apikey",
    });
    expect(answer.ok).toBe(true);
    expect(answer.row?.enabled).toBe(false);
    expect(answer.row?.keyref).toBe("customllm.apikey");
    expect(registry.listproviders()).toHaveLength(1);
  });

  it("refuses a provider without a label, a credential name or a public url", () => {
    const registry = createmcpregistry(memorystorage());
    expect(registry.addprovider({ label: "", baseUrl: "https://api.example.com", keyref: "k" }).ok).toBe(false);
    expect(registry.addprovider({ label: "x", baseUrl: "https://api.example.com", keyref: "  " }).ok).toBe(false);
    expect(registry.addprovider({ label: "x", baseUrl: "http://127.0.0.1:11434", keyref: "k" }).ok).toBe(false);
    expect(registry.listproviders()).toHaveLength(0);
  });

  it("updates and removes a provider", () => {
    const registry = createmcpregistry(memorystorage());
    const added = registry.addprovider({ label: "the custom llm", baseUrl: "https://api.example.com", keyref: "k" });
    const id = added.row?.id ?? "";
    expect(registry.updateprovider(id, { enabled: true }).row?.enabled).toBe(true);
    expect(registry.updateprovider(id, { keyref: "renamed.key" }).row?.keyref).toBe("renamed.key");
    expect(registry.updateprovider(id, { baseUrl: "http://[fe80::1]" }).ok).toBe(false);
    expect(registry.removeprovider(id).ok).toBe(true);
    expect(registry.removeprovider(id).ok).toBe(false);
  });
});

describe("mcp registry storage", () => {
  it("writes every mutation through the adapter the caller injected", () => {
    const storage = memorystorage();
    const first = createmcpregistry(storage);
    first.addendpoint({ label: "the family mcp", url: "https://mcp.example.com" });
    first.addprovider({ label: "the custom llm", baseUrl: "https://api.example.com", keyref: "k" });
    const second = createmcpregistry(storage);
    expect(second.listendpoints()).toHaveLength(1);
    expect(second.listproviders()).toHaveLength(1);
  });

  it("boots on the hardcoded defaults when the storage answers nothing", () => {
    const registry = createmcpregistry(memorystorage());
    expect(registry.listendpoints()).toEqual([]);
    expect(registry.listproviders()).toEqual([]);
  });
});
