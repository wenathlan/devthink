import { describe, expect, it } from "vitest";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  adapterdeclarationsof,
  capabilityprobeof,
  chromestorageadapter,
  denokvadapter,
  dommapof,
  downgradesof,
  fetchshellof,
  filesystemstorageadapter,
  memorystorageadapter,
  portablecapabilityset,
  runtimeadapterdeclarationof,
  runtimeadapterof,
  runtimecapabilitiestable,
  timershellof,
  workermapof,
} from "../runtime.js";
import { actionkindcatalog, actionrisk, adaptermappinggate, capabilitydowngradegate } from "../policy.js";
import { sessionmemory } from "../memory.js";
import type { capabilityprobe } from "../types.js";

const now = 1_800_000_000_000;

describe("capability probes", () => {
  it("probes the dom, storage, network and worker capabilities of one runtime without failing anything", () => {
    expect(capabilityprobeof({ dom: true, storage: true, network: true, worker: true })).toEqual({
      dom: true,
      storage: true,
      network: true,
      worker: true,
    });
    const table = runtimecapabilitiestable();
    expect(table.browser).toEqual({ dom: true, storage: true, network: true, worker: true });
    expect(table.node.dom).toBe(false);
    expect(table.bun.storage).toBe(true);
    expect(table.deno.worker).toBe(true);
  });

  it("declares the adapter mapping of every platform target", () => {
    expect(runtimeadapterdeclarationof("browser")).toMatchObject({
      runtime: "browser",
      storage: "chrome",
      worker: "webworker",
      dom: "livepage",
    });
    expect(runtimeadapterdeclarationof("browser", true).dom).toBe("remote");
    expect(runtimeadapterdeclarationof("node")).toMatchObject({
      storage: "filesystem",
      worker: "workerthreads",
      dom: "remote",
    });
    expect(runtimeadapterdeclarationof("bun").storage).toBe("filesystem");
    expect(runtimeadapterdeclarationof("deno")).toMatchObject({
      storage: "denokv",
      worker: "webworker",
      dom: "remote",
    });
    expect(adapterdeclarationsof()).toHaveLength(4);
    expect(workermapof("node")).toBe("workerthreads");
    expect(workermapof("deno")).toBe("webworker");
    expect(dommapof("browser")).toBe("livepage");
    expect(dommapof("headless")).toBe("remote");
  });

  it("gates the adapter mapping against its platform target", () => {
    for (const runtime of ["browser", "node", "bun", "deno"] as const) {
      expect(adaptermappinggate({ adapter: runtimeadapterdeclarationof(runtime) }).allowed).toBe(true);
      expect(
        adaptermappinggate({
          adapter: runtimeadapterdeclarationof(runtime, runtime === "browser"),
          headless: runtime === "browser",
        }).allowed,
      ).toBe(true);
    }
    expect(adaptermappinggate({ adapter: { ...runtimeadapterdeclarationof("node"), storage: "chrome" } }).allowed).toBe(
      false,
    );
    expect(
      adaptermappinggate({ adapter: { ...runtimeadapterdeclarationof("deno"), storage: "filesystem" } }).allowed,
    ).toBe(false);
    expect(
      adaptermappinggate({ adapter: { ...runtimeadapterdeclarationof("bun"), worker: "webworker" } }).allowed,
    ).toBe(false);
    expect(
      adaptermappinggate({ adapter: { ...runtimeadapterdeclarationof("browser"), dom: "remote" }, headless: false })
        .allowed,
    ).toBe(false);
    expect(
      adaptermappinggate({ adapter: { ...runtimeadapterdeclarationof("node"), fetch: "shim" as never } }).allowed,
    ).toBe(false);
  });

  it("downgrades features instead of failing the runtime", () => {
    const probes = capabilityprobeof({ dom: false, storage: true, network: true, worker: true });
    const downgrades = downgradesof({
      features: [
        { feature: "page capture", capability: "dom" },
        { feature: "profile store", capability: "storage" },
      ],
      probes,
    });
    expect(downgrades).toHaveLength(1);
    expect(downgrades[0]).toMatchObject({ feature: "page capture", capability: "dom" });
    expect(downgrades[0]?.reason).toMatch(/downgrades instead of failing the runtime/);
    expect(capabilitydowngradegate({ downgraded: downgrades, failed: [] }).allowed).toBe(true);
    expect(capabilitydowngradegate({ downgraded: [], failed: ["dom"] }).allowed).toBe(false);
    expect(capabilitydowngradegate({ downgraded: [], failed: [] }).reason).toMatch(/no feature downgrades/);
  });

  it("derives the portable capability set from the probes and the reviewed vocabulary", () => {
    const vocabulary = actionkindcatalog();
    expect(vocabulary).toContain("observe");
    expect(vocabulary).toContain("click");
    const domprobes = capabilityprobeof({ dom: true, storage: true, network: true, worker: true });
    expect(portablecapabilityset({ vocabulary, probes: domprobes })).toEqual(vocabulary);
    const domless = portablecapabilityset({
      vocabulary,
      probes: capabilityprobeof({ dom: false, storage: true, network: true, worker: true }),
      domlesskinds: vocabulary.filter((kind) => {
        try {
          return actionrisk(kind as never) === "read";
        } catch {
          return false;
        }
      }),
    });
    expect(domless).not.toContain("click");
    expect(domless).toContain("readtext");
    expect(
      portablecapabilityset({
        vocabulary,
        probes: { dom: false, storage: true, network: true, worker: true } as capabilityprobe,
      }),
    ).toEqual([]);
  });
});

describe("runtime shells", () => {
  it("maps the filesystem onto the storage seam for node and bun runtimes", async () => {
    const base = join("tests", "artifacts", "librarymodes", "storage");
    await rm(base, { recursive: true, force: true });
    const adapter = filesystemstorageadapter(
      {
        readfile: (path) => readFile(path, "utf8"),
        writefile: (path, data) => writeFile(path, data, "utf8"),
        mkdir: async (path) => {
          await mkdir(path, { recursive: true });
        },
        join: (...parts) => join(...parts),
      },
      base,
    );
    expect(await adapter.get("config")).toBeUndefined();
    await adapter.set("config", { provider: "local" });
    expect(await adapter.get("config")).toMatchObject({ provider: "local" });
    await adapter.set("audit", [{ id: "a1" }]);
    expect(await adapter.get<Array<{ id: string }>>("audit")).toEqual([{ id: "a1" }]);
    await rm(base, { recursive: true, force: true });
  });

  it("maps chrome storage and deno kv onto the same seam", async () => {
    const area = new Map<string, unknown>();
    const chrome = chromestorageadapter({
      get: async (key) => area.get(key),
      set: async (key, value) => {
        area.set(key, value);
      },
    });
    await chrome.set("session", { id: "s1" });
    expect(await chrome.get("session")).toMatchObject({ id: "s1" });
    const kv = new Map<string, unknown>();
    const deno = denokvadapter({
      get: async <T>(key: string) => kv.get(key) as T | undefined,
      set: async <T>(key: string, value: T) => {
        kv.set(key, value);
      },
    });
    await deno.set("profile", { name: "work" });
    expect(await deno.get("profile")).toMatchObject({ name: "work" });
    const memory = memorystorageadapter();
    await memory.set("plan", { id: "p1" });
    expect(await memory.get("plan")).toMatchObject({ id: "p1" });
    const seeded = memorystorageadapter(new Map([["seeded", 7]]));
    expect(await seeded.get("seeded")).toBe(7);
  });

  it("drives the same session memory through every adapter so the profile store format stays one", async () => {
    const store = new Map<string, unknown>();
    const memory = new sessionmemory(
      chromestorageadapter({
        get: async (key) => store.get(key),
        set: async (key, value) => {
          store.set(key, value);
        },
      }),
    );
    await memory.setconfig({ provider: "local" } as never);
    const filesystem = new sessionmemory(memorystorageadapter(store));
    expect(await filesystem.getconfig()).toMatchObject({ provider: "local" });
  });

  it("provides the timer and fetch shells from the injected platform primitives", async () => {
    const scheduled: Array<() => void> = [];
    const timer = timershellof({
      settimeout: (callback) => {
        scheduled.push(callback);
        return scheduled.length;
      },
      now: () => now,
    });
    const handle = timer.schedule(() => "ran", 50);
    expect(handle).toBe(1);
    expect(timer.now()).toBe(now);
    (scheduled[0] as () => void)();
    const fetches: string[] = [];
    const fetchshell = fetchshellof({
      fetch: async (input) => {
        fetches.push(input);
        return { ok: true };
      },
    });
    await fetchshell.fetch("https://example.org");
    expect(fetches).toEqual(["https://example.org"]);
  });

  it("composes one runtime adapter from its declaration, probes and injected primitives", () => {
    const store = new Map<string, unknown>();
    const adapter = runtimeadapterof({
      runtime: "node",
      storage: memorystorageadapter(store),
      timer: {
        settimeout: (callback) => {
          callback();
          return 0;
        },
        now: () => now,
      },
      fetch: { fetch: async (input) => input },
    });
    expect(adapter.declaration).toMatchObject({ runtime: "node", storage: "filesystem" });
    expect(adapter.probes.dom).toBe(false);
    expect(adapter.storage).toBeDefined();
    expect(adapter.timer?.now()).toBe(now);
    expect(adapter.fetch).toBeDefined();
    expect(runtimeadapterof({ runtime: "browser" }).storage).toBeUndefined();
    expect(runtimeadapterof({ runtime: "deno" }).declaration.storage).toBe("denokv");
  });
});
