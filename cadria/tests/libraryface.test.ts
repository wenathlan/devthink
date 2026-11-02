// # libraryface — the published surface of the cadria package, runnable with
// the house vitest suite:
//   bunx vitest run tests/libraryface.test.ts
// The 2.0.153 audit lesson: the envelope shipped only README, docs and
// tests — no exports, no engine files — so no sibling could import the
// versawase engine the family law promises (the debonair package description
// already declared "imports versawase from cadria" and nothing could consume
// it). This file pins the consumable surface: every declared export target
// exists as the published source form, rides the files list, and the
// pure-closure lane imports live in plain Node (the node 26 native type
// stripping doctrine the vault package battery established).
//
// The specifier lane (the seven entries whose closure carries a runtime
// value import of a family specifier — synthpalette and the synthesis chain
// ride @wenathlan/debonair/audiofeatures, labels rides
// @wenathlan/vault/labelstore) answers the structure and files pins here
// while the behavior stays pinned by the module batteries (synthpalette,
// synthcomposition, synthtexture, synthmotion, imagestyles, imageexport and
// the labels walk of the copy law) — the registry envelope resolves those
// specifiers for the embedder, and the vitest aliases resolve them to the
// sibling source inside the monorepo.

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, it } from "vitest";

/** one conditions entry of the exports map (the source form the family publishes). */
type ExportEntry = { types: string; import: string; default: string };

/** the manifest slice this suite reads. */
type PackageJson = {
  exports: Record<string, ExportEntry>;
  files: string[];
  version: string;
};

/** reads the package manifest of the cadria root. */
async function readPackage(): Promise<PackageJson> {
  const root = dirname(fileURLToPath(new URL(import.meta.url)));
  return JSON.parse(await readFile(resolve(root, "../package.json"), "utf8"));
}

/** the export entries whose closure carries a runtime family specifier: the
 * synthesis chain rides @wenathlan/debonair (audiofeatures value imports)
 * and the labels consumer rides @wenathlan/vault/labelstore — the registry
 * envelope owns their resolution for the embedder. */
const SPECIFIER_LANE: readonly string[] = [
  "./synthpalette",
  "./synthcomposition",
  "./synthmotion",
  "./imagestyles",
  "./imageexport",
  "./imageproject",
  "./labels",
];

describe("the library face", () => {
  it("declares the engine surface the family law promises", async () => {
    const packagejson = await readPackage();
    const specifiers = Object.keys(packagejson.exports);
    assert.ok(specifiers.length >= 35, "the exports map carries the engine surface, not the empty envelope");
    for (const promised of [
      "./versawase",
      "./versawase3d",
      "./shadercomp",
      "./versawaserender",
      "./visualize",
      "./timelineedit",
      "./mediaprobe",
      "./synthpalette",
      "./labels",
    ]) {
      assert.ok(specifiers.includes(promised), `"${promised}" rides the exports map`);
    }
  });

  it("answers every entry in the published source form", async () => {
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
    }
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

  it("imports the pure closure live in plain node", async () => {
    const packagejson = await readPackage();
    const root = dirname(fileURLToPath(new URL(import.meta.url)));
    const specifierLane = new Set(SPECIFIER_LANE);
    const pure = Object.entries(packagejson.exports).filter(([name]) => !specifierLane.has(name));
    assert.ok(pure.length >= 28, "the pure closure covers the engine core");
    for (const [specifier, entry] of pure) {
      const resolved = resolve(root, "..", entry.import);
      const module = await import(pathToFileURL(resolved).href);
      assert.ok(
        module !== null && typeof module === "object",
        `"${specifier}" resolves to a live module in plain node`,
      );
    }
  });

  it("keeps the published graph explicit for the node native doctrine", async () => {
    /* the published form is the source itself, so the embedder's runtime
     * resolves the graph the way node resolves it — and node native ESM
     * refuses a relative import without its extension. This walk pins the
     * doctrine over the pure closure: every relative import of every pure
     * export target resolves to a real file with the extension spelled
     * out, and the only specifiers the closure may carry are the family
     * packages and the declared runtime deps (three). */
    const root = dirname(fileURLToPath(new URL(import.meta.url)));
    const packagejson = await readPackage();
    const specifierLane = new Set(SPECIFIER_LANE);
    const seeds = Object.entries(packagejson.exports)
      .filter(([name]) => !specifierLane.has(name))
      .map(([, entry]) => resolve(root, "..", entry.import));
    const seen = new Set<string>();
    const pending = [...seeds];
    while (pending.length > 0) {
      const filename = pending.pop() as string;
      if (seen.has(filename)) continue;
      seen.add(filename);
      const source = await readFile(filename, "utf8");
      for (const match of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
        const specifier = match[1];
        if (specifier.startsWith(".")) {
          assert.match(
            specifier,
            /\.ts$/,
            `${filename} imports "${specifier}" without the extension — the node native doctrine refuses it`,
          );
          const child = resolve(dirname(filename), specifier);
          assert.ok(existsSync(child), `${filename} imports "${specifier}" — the target must exist`);
          pending.push(child);
        } else {
          assert.match(
            specifier,
            /^(@wenathlan\/|three$|node:)/,
            `${filename} imports "${specifier}" — only the family specifiers, three and the node builtins ride the published graph`,
          );
        }
      }
    }
    assert.ok(seen.size >= 28, "the walk covered every pure published module and its local closure");
  });

  it("answers the family lockstep on the manifest version", async () => {
    const packagejson = await readPackage();
    /* the 2.1.7 supply-chain rung climbed the family above the stale
     * standalone saddle line (2.1.6 of the pre-family era) so the caret
     * ranges resolve the current build — the lockstep pattern reads the
     * family major the rung carries, never one frozen minor line */
    assert.match(packagejson.version, /^2\.\d+\./, "the cadria envelope rides the family rung");
  });
});
