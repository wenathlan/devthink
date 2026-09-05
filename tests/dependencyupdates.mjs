/** Proposes stable direct dependency updates and blocks every breaking SemVer boundary unless explicitly allowed. */
import { readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
const allowmajors = process.argv.includes("--allow-majors");
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const parseversion = value => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value.replace(/^[~^]/, ""));
  if (!match) throw new Error(`Unsupported dependency version: ${value}`);
  return match.slice(1).map(Number);
};
const breaking = (current, latest) => {
  const [major, minor] = parseversion(current);
  const [latestmajor, latestminor] = parseversion(latest);
  return major !== latestmajor || (major === 0 && minor !== latestminor);
};
const skippedmajors = [];
const next = structuredClone(packagejson);
for (const section of ["dependencies", "devDependencies", "optionalDependencies"]) {
  for (const [name, declared] of Object.entries(packagejson[section] ?? {})) {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error(`npm registry returned ${response.status} for ${name}`);
    const latest = (await response.json())?.["dist-tags"]?.latest;
    if (!/^\d+\.\d+\.\d+$/.test(latest ?? "")) throw new Error(`npm registry did not provide a stable version for ${name}`);
    if (breaking(declared, latest) && !allowmajors) {
      skippedmajors.push({ name, current: declared, latest });
      continue;
    }
    next[section][name] = `${declared.startsWith("~") ? "~" : "^"}${latest}`;
  }
}
const current = `${JSON.stringify(packagejson, null, 2)}\n`;
const rendered = `${JSON.stringify(next, null, 2)}\n`;
const drift = current !== rendered;
if (drift && mode === "sync") await writeFile("package.json", rendered);
if (drift && mode === "check") throw new Error("Non-breaking dependency updates are available. Run pnpm dependency:updates in a review branch.");
console.log(JSON.stringify({ mode, allowmajors, skippedmajors, drift }, null, 2));
