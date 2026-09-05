/** Proposes current stable runtimes from official registries without silently crossing a major compatibility boundary. */
import { readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
const allowmajors = process.argv.includes("--allow-majors");
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const [npmregistry, pnpmregistry, bunregistry, nodeindex] = await Promise.all([
  fetch("https://registry.npmjs.org/npm/latest").then(response => response.ok ? response.json() : Promise.reject(new Error(`npm registry returned ${response.status}`))),
  fetch("https://registry.npmjs.org/pnpm").then(response => response.ok ? response.json() : Promise.reject(new Error(`npm registry returned ${response.status}`))),
  fetch("https://registry.npmjs.org/bun/latest").then(response => response.ok ? response.json() : Promise.reject(new Error(`npm registry returned ${response.status}`))),
  fetch("https://nodejs.org/dist/index.json").then(response => response.ok ? response.json() : Promise.reject(new Error(`Node release index returned ${response.status}`))),
]);
const pnpmversion = pnpmregistry?.["dist-tags"]?.latest;
const npmversion = npmregistry?.version;
const bunversion = bunregistry?.version;
const lateststable = nodeindex.find(release => /^v\d+\.\d+\.\d+$/.test(release.version) && !release.lts?.includes?.("Maintenance"));
if (![pnpmversion, npmversion, bunversion].every(version => /^\d+\.\d+\.\d+$/.test(version ?? ""))) throw new Error("The npm registry did not provide a stable npm, pnpm or Bun version.");
if (!lateststable) throw new Error("The Node release index did not provide a stable release.");
const declarednode = /^>=(\d+)\.\d+\.\d+ <\d+$/.exec(packagejson.engines?.node ?? "")?.[1];
const declarednpm = /^>=(\d+)\.\d+\.\d+ <\d+$/.exec(packagejson.engines?.npm ?? "")?.[1];
const declaredbun = /^>=(\d+)\.\d+\.\d+ <\d+$/.exec(packagejson.engines?.bun ?? "")?.[1];
const declaredpnpm = /^pnpm@(\d+)\./.exec(packagejson.packageManager ?? "")?.[1];
if (!declarednode || !declarednpm || !declaredbun || !declaredpnpm) throw new Error("Existing Node, npm, Bun and pnpm declarations must use the expected bounded forms.");
const nodeversion = lateststable.version.slice(1);
const latestnodemajor = nodeversion.split(".")[0];
const latestnpmmajor = npmversion.split(".")[0];
const latestbunmajor = bunversion.split(".")[0];
const latestpnpmmajor = pnpmversion.split(".")[0];
const nodemajor = allowmajors || latestnodemajor === declarednode ? latestnodemajor : declarednode;
const npmnext = allowmajors || latestnpmmajor === declarednpm ? npmversion : packagejson.engines.npm.match(/^>=(\d+\.\d+\.\d+)/)[1];
const bunnext = allowmajors || latestbunmajor === declaredbun ? bunversion : packagejson.engines.bun.match(/^>=(\d+\.\d+\.\d+)/)[1];
const pnpmnext = allowmajors || latestpnpmmajor === declaredpnpm ? pnpmversion : packagejson.packageManager.slice("pnpm@".length);
const next = {
  ...packagejson,
  engines: { ...packagejson.engines, node: `>=${allowmajors || latestnodemajor === declarednode ? nodeversion : packagejson.engines.node.match(/^>=(\d+\.\d+\.\d+)/)[1]} <${Number(nodemajor) + 1}`, npm: `>=${npmnext} <${Number(npmnext.split(".")[0]) + 1}`, bun: `>=${bunnext} <${Number(bunnext.split(".")[0]) + 1}` },
  packageManager: `pnpm@${pnpmnext}`,
};
const edits = [
  ["package.json", `${JSON.stringify(next, null, 2)}\n`],
  [".nvmrc", `${next.engines.node.match(/^>=(\d+\.\d+\.\d+)/)[1]}\n`],
  ["containerfile", (await readFile("containerfile", "utf8")).replace(/FROM node:\d+(?:\.\d+){0,2}-bookworm-slim/, `FROM node:${next.engines.node.match(/^>=(\d+\.\d+\.\d+)/)[1]}-bookworm-slim`)],
  [".github/workflows/verify.yml", (await readFile(".github/workflows/verify.yml", "utf8")).replace(/bun-version: \d+\.\d+\.\d+/, `bun-version: ${bunnext}`)],
  [".github/workflows/maintenance.yml", (await readFile(".github/workflows/maintenance.yml", "utf8")).replace(/bun-version: \d+\.\d+\.\d+/, `bun-version: ${bunnext}`)],
];
let drift = false;
for (const [path, rendered] of edits) {
  const current = await readFile(path, "utf8");
  if (current !== rendered) {
    drift = true;
    if (mode === "sync") await writeFile(path, rendered);
  }
}
if (drift && mode === "check") throw new Error("Maintenance metadata is outdated. Run pnpm sync:maintenance in a review branch.");
console.log(JSON.stringify({ mode, allowmajors, node: next.engines.node, npm: next.engines.npm, bun: next.engines.bun, pnpm: `pnpm@${pnpmnext}`, skippedMajors: { node: latestnodemajor !== declarednode && !allowmajors, npm: latestnpmmajor !== declarednpm && !allowmajors, bun: latestbunmajor !== declaredbun && !allowmajors, pnpm: latestpnpmmajor !== declaredpnpm && !allowmajors }, drift }, null, 2));
