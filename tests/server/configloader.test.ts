/**
 * configloader — definition loading and validation tests
 * cache semantics, validation problem detection for every misconfiguration,
 * reload behavior and the version access helpers
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chdir, cwd } from "node:process";
import { describe, expect, it } from "vitest";

import { getversion, listversions, loadconfig, reloadconfig, validateconfig } from "../../config.js";
import type { gatewayconfig, gatewaydefinition } from "../../types.js";

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------

function fullcfg(id: string): gatewayconfig {
  return {
    id,
    providername: "mock",
    upstreams: [{ name: "mock", baseurl: "http://up" }],
    auth: { mode: "bearer", required: false },
    models: [{ id: "m1", context: 8192, maxoutput: 1024 }],
    defaultmodel: "m1",
    metamodel: { id: "meta", maxoutput: 512 },
  };
}

function validdef(): gatewaydefinition {
  return {
    name: "t",
    description: "d",
    versions: { v1: fullcfg("v1") },
  };
}

// ---------------------------------------------------------------------------
// loadconfig — resolution and caching
// ---------------------------------------------------------------------------

describe("loadconfig — resolution", () => {
  it("returns a definition object", async () => {
    const def = await loadconfig();
    expect(def).toBeTruthy();
    expect(typeof def).toBe("object");
    expect("versions" in def).toBe(true);
  });
  it("loadconfig is cached — the same object identity returns", async () => {
    const a = await loadconfig();
    const b = await loadconfig();
    expect(a).toBe(b);
  });
  it("reloadconfig re-runs the resolution and pins a fresh cache", async () => {
    const a = await loadconfig();
    const b = await reloadconfig();
    expect(b).toBeTruthy();
    expect("versions" in b).toBe(true);
    // the fresh cache pins again — note the esm module cache may return the
    // same config object identity for the same file: reload re-resolves the
    // search path (new files are picked up) without promising a new identity
    const c = await loadconfig();
    expect(c).toBe(b);
    expect("versions" in a).toBe(true);
  });
});

describe("getversion listversions", () => {
  it("listversions returns string keys", async () => {
    const list = await listversions();
    expect(Array.isArray(list)).toBe(true);
    for (const id of list) expect(typeof id).toBe("string");
  });
  it("getversion returns null for unknown ids", async () => {
    expect(await getversion("definitely-not-a-version")).toBeNull();
  });
  it("getversion returns the config for known ids", async () => {
    const list = await listversions();
    if (list.length > 0) {
      const cfg = await getversion(list[0]);
      expect(cfg).not.toBeNull();
      expect(cfg?.id).toBe(list[0]);
    }
  });
});

describe("loadconfig — .mjs consumer configs", () => {
  it("an .mjs config in the cwd loads (the cli scaffold flavor)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "gateway-cfg-"));
    const original = cwd();
    try {
      writeFileSync(
        join(dir, "gateway.config.mjs"),
        [
          "export const config = {",
          '  name: "mjs consumer",',
          "  versions: {",
          "    vt: {",
          '      id: "vt",',
          '      providername: "mock",',
          '      upstreams: [{ name: "mock", baseurl: "http://up" }],',
          '      auth: { mode: "bearer", required: false },',
          "      models: [{ id: 'm1', context: 8192, maxoutput: 1024 }],",
          "      defaultmodel: 'm1',",
          "      metamodel: { id: 'meta', maxoutput: 512 },",
          "    },",
          "  },",
          "}",
          "export default config",
        ].join("\n"),
      );
      chdir(dir);
      const def = await reloadconfig();
      expect(def.name).toBe("mjs consumer");
      expect(Object.keys(def.versions)).toEqual(["vt"]);
      expect(def.versions["vt"]?.providername).toBe("mock");
      expect(validateconfig(def)).toEqual([]);
    } finally {
      chdir(original);
      rmSync(dir, { recursive: true, force: true });
      // restore the cache for the tests that follow
      await reloadconfig();
    }
  });

  it("an .mjs config wins over a same-directory .ts (scaffold flavor first)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "gateway-cfg-"));
    mkdirSync(join(dir, "web"), { recursive: true });
    const original = cwd();
    try {
      writeFileSync(
        join(dir, "web", "config.mjs"),
        'export const config = { name: "mjs-wins", versions: {} }\nexport default config\n',
      );
      writeFileSync(
        join(dir, "web", "config.ts"),
        'export const config = { name: "should-lose", versions: {} }\nexport default config\n',
      );
      chdir(dir);
      const def = await reloadconfig();
      // the .mjs pair is probed before the .ts pair within the same base
      expect(def.name).toBe("mjs-wins");
    } finally {
      chdir(original);
      rmSync(dir, { recursive: true, force: true });
      await reloadconfig();
    }
  });
});

// ---------------------------------------------------------------------------
// validateconfig — every problem class
// ---------------------------------------------------------------------------

describe("validateconfig — problem detection", () => {
  it("a valid definition reports zero problems", () => {
    expect(validateconfig(validdef())).toEqual([]);
  });

  it("empty versions map is a problem", () => {
    const problems = validateconfig({ versions: {} });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("no versions");
  });

  it("missing version map entirely is a problem", () => {
    const problems = validateconfig({} as gatewaydefinition);
    expect(problems).toHaveLength(1);
  });

  it("id mismatch between key and cfg id is detected", () => {
    const def = validdef();
    def.versions["v1"] = { ...def.versions["v1"], id: "wrong" };
    const problems = validateconfig(def);
    expect(problems.some((p) => p.includes("id mismatch"))).toBe(true);
  });

  it("missing id providername upstreams auth models metamodel are all detected", () => {
    const broken = {
      id: "v1",
      providername: "",
      upstreams: [],
      auth: undefined,
      models: [],
      metamodel: undefined,
    } as unknown as gatewayconfig;
    const problems = validateconfig({ versions: { v1: broken } });
    expect(problems.some((p) => p.includes("missing id"))).toBe(false); // id present
    expect(problems.some((p) => p.includes("missing providername"))).toBe(true);
    expect(problems.some((p) => p.includes("no upstreams"))).toBe(true);
    expect(problems.some((p) => p.includes("missing auth"))).toBe(true);
    expect(problems.some((p) => p.includes("no models"))).toBe(true);
    expect(problems.some((p) => p.includes("missing metamodel id"))).toBe(true);
  });

  it("rotation models outside the catalog are flagged", () => {
    const def = validdef();
    def.versions["v1"] = {
      ...def.versions["v1"],
      rotation: { mode: "persession", models: ["ghost-model"] },
    };
    const problems = validateconfig(def);
    expect(problems.some((p) => p.includes("rotation model ghost-model"))).toBe(true);
  });

  it("unknown defaultmodel is flagged", () => {
    const def = validdef();
    def.versions["v1"] = { ...def.versions["v1"], defaultmodel: "ghost" };
    const problems = validateconfig(def);
    expect(problems.some((p) => p.includes("defaultmodel ghost"))).toBe(true);
  });

  it("defaultmodel equal to the meta id is allowed", () => {
    const def = validdef();
    def.versions["v1"] = { ...def.versions["v1"], defaultmodel: "meta" };
    expect(validateconfig(def)).toEqual([]);
  });

  it("required env auth without envvar is flagged", () => {
    const def = validdef();
    def.versions["v1"] = {
      ...def.versions["v1"],
      auth: { mode: "bearer", required: true, keysources: ["env"] },
    };
    const problems = validateconfig(def);
    expect(problems.some((p) => p.includes("envvar is not set"))).toBe(true);
  });

  it("problems carry the version prefix", () => {
    const def = validdef();
    def.versions["v1"] = { ...def.versions["v1"], providername: "" };
    const problems = validateconfig(def);
    expect(problems[0].startsWith("version v1:")).toBe(true);
  });
});
