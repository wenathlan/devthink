/**
 * package surface tests import every declared export target and catch accidental runtime coupling.
 */

import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { releaseartifactmatrix } from "../distribution.js";

/* The transport-neutral graph of the grand merge: the flat domain files
   bundle full-stack sections, so the browser-loadable surface is the curated
   set of domains whose whole import closure stays free of Node-only modules
   (foundation, intelligence, automation). The node-only capabilities keep
   their deep exports (./memory-*, ./sessions-file, ./release-*, ...). */
const transportneutral = ["dist/foundation.js", "dist/intelligence.js", "dist/automation.js"];

describe("the package surface", () => {
it("imports every declared package export target in Node", async () => {
  const root = dirname(fileURLToPath(new URL(import.meta.url)));
  const packagejson = JSON.parse(await readFile(resolve(root, "../package.json"), "utf8"));
  for (const target of Object.values(packagejson.exports)) {
    assert.equal(typeof target, "string");
    const resolved = resolve(root, "..", target);
    /* the virtual-hardware envelope carriers (.config data documents, .json
       hardware specs) are data files: assert readability, not module import */
    if (/\.(?:config|json)$/.test(target)) {
      await readFile(resolved, "utf8");
      continue;
    }
    await import(pathToFileURL(resolved).href);
  }
});

it("declares runtime metadata and an optional browser provider peer", async () => {
  const root = dirname(fileURLToPath(new URL(import.meta.url)));
  const packagejson = JSON.parse(await readFile(resolve(root, "../package.json"), "utf8"));
  assert.equal(packagejson.private, false);
  /* the 2.0.133 publish regression taught the lesson: the engines floor is
     not a constant to freeze in a test — it walks with the node pin the
     maintenance rung stamps, so the assertion derives the bounded form from
     the .nvmrc the rung carries beside this manifest (a rung that walks one
     without the other answers red here, never in the publish lane again) */
  const nodepin = (await readFile(resolve(root, "../.nvmrc"), "utf8")).trim();
  const nodemajor = Number(nodepin.split(".")[0]);
  assert.equal(packagejson.engines.node, `>=${nodepin} <${nodemajor + 1}`);
  /* the dependency union law rides the twelve manifests on one set: the
     package manager of the family climbed to the pnpm rung (the engine
     floors beside it walk the caret union), so the assertion pins the
     union's manager seat the way the rung stamps it */
  assert.equal(packagejson.packageManager, "pnpm@12.3.4");
  assert.equal(packagejson.peerDependencies.playwright, "^1.63.0");
  assert.equal(packagejson.peerDependenciesMeta.playwright.optional, true);
  assert.equal(packagejson.exports["./browser-playwright"], "./dist/browser.js");
});

it("keeps transport-neutral export graphs free of Node-only imports", async () => {
  const root = dirname(fileURLToPath(new URL(import.meta.url)));
  const seen = new Set();
  const pending = transportneutral.map((entry) => resolve(root, "..", entry));
  while (pending.length) {
    const filename = pending.pop();
    if (seen.has(filename)) continue;
    seen.add(filename);
    const source = await readFile(filename, "utf8");
    assert.doesNotMatch(source, /from\s+["']node:/, `${filename} imports a Node-only module`);
    for (const match of source.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) {
      const specifier = match[1];
      if (!specifier.startsWith(".")) continue;
      const child = resolve(dirname(filename), specifier);
      pending.push(child.endsWith(".js") ? child : `${child}.js`);
    }
  }
  assert.equal(seen.has(resolve(root, "..", "dist/foundation.js")), true);
  assert.equal(seen.has(resolve(root, "..", "dist/automation.js")), true);
});

it("creates the expanded release matrix without vendor coupling", () => {
  const matrix = releaseartifactmatrix("1.8.14", { signing: "caller-owned" });
  assert.equal(matrix.entries.length, 11);
  assert.deepEqual(matrix.entries.find((entry) => entry.platform === "windows" && entry.architecture === "x86")?.files, ["saddle.browser.1.8.14.x86.exe", "saddle.browser.1.8.14.x86.msi"]);
  assert.deepEqual(matrix.entries.find((entry) => entry.surface === "android")?.files, ["saddle.apk.1.8.14.apk", "saddle.aab.1.8.14.aab"]);
  assert.equal(matrix.entries.find((entry) => entry.surface === "container")?.manifest, "manifest.container.1.8.14.json");
});
});
