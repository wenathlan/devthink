// # package.test — the published surface of the vault package, runnable
// with the house vitest suite:
//   bunx vitest run tests/package.test.ts
// The 2.0.151 envelope lesson: the published package carried only docs,
// tests and a README — no main, no types, no exports — so no sibling could
// import the storage engine the family law promises (the ten apps declared
// the dependency and nobody could consume it). This file pins the
// consumable surface: every declared export target exists, imports in
// Node, and ships in the published files list, the barrel carries the
// engine, and the entry metadata answers the family lockstep.

import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, it } from "vitest";

/* the isolation of the suite (the quotaisolation precedent): the engine
 * chain opens its sqlite singletons at import, so both connections route
 * into the throwaway store of tests/tmp BEFORE any export target is
 * imported — the dynamic imports of the tests below evaluate after this
 * module body, and the *.db gitignore law keeps the throwaway out of the
 * tree. */
process.env.VAULT_STORAGE_URL = "file:./tests/tmp/package.test.storage.db";
process.env.DATABASE_URL = "file:./tests/tmp/package.test.site.db";
for (const file of ["package.test.storage.db", "package.test.site.db"]) {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`tests/tmp/${file}${suffix}`, { force: true });
  }
}

/** one conditions entry of the exports map (the source form the family publishes). */
type ExportEntry = { types: string; import: string; default: string };

/** the manifest slice this suite reads. */
type PackageJson = {
  exports: Record<string, ExportEntry>;
  files: string[];
  main: string;
  types: string;
  version: string;
  engines: { node: string };
};

/** reads the package manifest of the vault root. */
async function readPackage(): Promise<PackageJson> {
  const root = dirname(fileURLToPath(new URL(import.meta.url)));
  return JSON.parse(await readFile(resolve(root, "../package.json"), "utf8"));
}

describe("the package surface", () => {
  it("imports every declared package export target in Node", async () => {
    const packagejson = await readPackage();
    const entries = Object.entries(packagejson.exports);
    assert.ok(entries.length > 1, "the exports map is not the empty envelope anymore");
    for (const [specifier, entry] of entries) {
      assert.equal(typeof entry, "object", `"${specifier}" declares conditions, not a bare string`);
      assert.equal(typeof entry.types, "string", `"${specifier}" declares the types condition first`);
      assert.equal(entry.import, entry.default, `"${specifier}" answers one module under import and default`);
      assert.match(entry.import, /\.ts$/, `"${specifier}" rides the published source form (the node 26 pin)`);
      const resolved = resolve(dirname(fileURLToPath(new URL(import.meta.url))), "..", entry.import);
      await readFile(resolved, "utf8");
      const module = await import(pathToFileURL(resolved).href);
      assert.ok(module !== null && typeof module === "object", `"${specifier}" resolves to a live module`);
    }
  });

  it("carries the storage engine on the barrel", async () => {
    const root = dirname(fileURLToPath(new URL(import.meta.url)));
    const barrel = await import(pathToFileURL(resolve(root, "../index.ts")).href);
    assert.equal(typeof barrel.putObject, "function", "the ledger deposit rides the barrel");
    assert.equal(typeof barrel.getObject, "function", "the verified read rides the barrel");
    assert.equal(typeof barrel.sha256Hex, "function", "the real digest engine rides the barrel");
    assert.equal(typeof barrel.quotaVerdict, "function", "the quota verdict rides the barrel");
    assert.equal(typeof barrel.createVaultServer, "function", "the http surface rides the barrel");
    assert.equal(barrel.CHUNK_BYTES, 262_144, "the chunk window is pinned on the barrel");
  });

  it("ships every declared export target in the published files list", async () => {
    const packagejson = await readPackage();
    const files = new Set(packagejson.files);
    assert.ok(files.has("docs") && files.has("tests"), "the documentation and tests envelope stays");
    for (const [specifier, entry] of Object.entries(packagejson.exports)) {
      const target = entry.import.slice(2);
      assert.ok(
        files.has(target),
        `"${specifier}" → "${target}" must ride the files list or the envelope ships an empty door`,
      );
    }
  });

  it("keeps the published graph explicit for the node native doctrine", async () => {
    /* the published form is the source itself, so the embedder's runtime
     * resolves the graph the way node resolves it — and node native ESM
     * refuses a relative import without its extension (the db.ts lesson of
     * this wave: `from "./labels"` rode green under vitest's bundler
     * resolution and broke the plain-node import of ./db). This walk pins
     * the doctrine over the whole published closure: every relative import
     * of every export target and everything they pull resolves to a real
     * file with the extension spelled out. */
    const root = dirname(fileURLToPath(new URL(import.meta.url)));
    const packagejson = await readPackage();
    const seen = new Set<string>();
    const pending = Object.values(packagejson.exports).map((entry) => resolve(root, "..", entry.import));
    while (pending.length > 0) {
      const filename = pending.pop() as string;
      if (seen.has(filename)) continue;
      seen.add(filename);
      const source = await readFile(filename, "utf8");
      for (const match of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
        const specifier = match[1];
        if (!specifier.startsWith(".")) continue;
        assert.match(
          specifier,
          /\.ts$/,
          `${filename} imports "${specifier}" without the extension — the node native doctrine refuses it`,
        );
        const child = resolve(dirname(filename), specifier);
        assert.ok(existsSync(child), `${filename} imports "${specifier}" — the target must exist`);
        pending.push(child);
      }
    }
    assert.ok(seen.size >= 18, "the walk covered every published module and its local closure");
  });

  it("declares the entry metadata and the node pin of the lockstep", async () => {
    const root = dirname(fileURLToPath(new URL(import.meta.url)));
    const packagejson = await readPackage();
    assert.equal(packagejson.main, "./index.ts", "main answers the barrel");
    assert.equal(packagejson.types, "./index.ts", "types answers the barrel");
    assert.equal(packagejson.exports["."].import, "./index.ts", "the dot specifier answers the barrel");
    assert.match(packagejson.version, /^\d+\.\d+\.\d+$/, "the version stays a semver the release lane walks");
    /* the engines floor is not a constant to freeze: it walks with the node
     * pin the maintenance rung stamps, so the assertion derives the bounded
     * form from the .nvmrc beside this manifest (the saddle derivation). */
    const nodepin = (await readFile(resolve(root, "../.nvmrc"), "utf8")).trim();
    const nodemajor = Number(nodepin.split(".")[0]);
    assert.equal(packagejson.engines.node, `>=${nodepin} <${nodemajor + 1}`);
  });
});
