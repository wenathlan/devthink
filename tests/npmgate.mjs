/** Verifies that public npm publishing remains explicit and token-safe. */
import { readFile } from "node:fs/promises";

const workflow = await readFile(".github/workflows/release.yml", "utf8");
const match = workflow.match(/^  npmjs:\n([\s\S]*?)(?=^  [a-z][a-z0-9_-]+:\n|\Z)/m);
if (!match) throw new Error("Release workflow is missing the npmjs publication job.");

const npmjs = match[0];
const requirements = [
  "NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN || secrets.NPM_TOKEN }}",
  "--registry=https://registry.npmjs.org",
  "--access public --provenance",
  "npm whoami",
  "npmjs version already exists; skipping publish.",
  "./release/wenathlan-extension-${RELEASE_VERSION}.tgz",
];
for (const requirement of requirements) {
  if (!npmjs.includes(requirement)) throw new Error(`npmjs gate is missing: ${requirement}`);
}
if (npmjs.includes("echo $NODE_AUTH_TOKEN") || npmjs.includes("echo $NPM_TOKEN")) {
  throw new Error("npmjs job must not print secret-backed environment variables.");
}
if (npmjs.includes("vars.PUBLISH_NPM")) throw new Error("npmjs must publish automatically after identity validation.");

const assemblematch = workflow.match(/^  assemble:\n([\s\S]*?)(?=^  [a-z][a-z0-9_-]+:\n|\Z)/m);
if (!assemblematch) throw new Error("Release workflow is missing the assemble job.");
const assemble = assemblematch[0];
const nativebundles = ["package/bridge.js", "package/companion.js", "package/nativehost.template.json", "package/gateway.js", "package/crossbrowser.js", "package/pack.js", "package/http.js", "package/manifest.json"];
for (const bundle of nativebundles) {
  if (!assemble.includes(`| grep -F "${bundle}"`)) throw new Error(`The npm tarball gate must allow the native bundle in the tarball: ${bundle}`);
}
console.log(JSON.stringify({ valid: true, automatic: true, tokenFallback: true, tokenLogging: false, nativeBundles: nativebundles.length }, null, 2));
