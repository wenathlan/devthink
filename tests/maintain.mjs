/** Proposes current stable runtimes from official registries without silently crossing a major compatibility boundary. */
import { readFile, writeFile } from "node:fs/promises";

const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
const allowmajors = process.argv.includes("--allow-majors");
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const [npmregistry, pnpmregistry, bunregistry, nodeindex] = await Promise.all([
  fetch("https://registry.npmjs.org/npm/latest").then((response) =>
    response.ok ? response.json() : Promise.reject(new Error(`npm registry returned ${response.status}`)),
  ),
  fetch("https://registry.npmjs.org/pnpm").then((response) =>
    response.ok ? response.json() : Promise.reject(new Error(`npm registry returned ${response.status}`)),
  ),
  fetch("https://registry.npmjs.org/bun/latest").then((response) =>
    response.ok ? response.json() : Promise.reject(new Error(`npm registry returned ${response.status}`)),
  ),
  fetch("https://nodejs.org/dist/index.json").then((response) =>
    response.ok ? response.json() : Promise.reject(new Error(`Node release index returned ${response.status}`)),
  ),
]);
const pnpmversion = pnpmregistry?.["dist-tags"]?.latest;
const npmversion = npmregistry?.version;
const bunversion = bunregistry?.version;
const lateststable = nodeindex.find(
  (release) => /^v\d+\.\d+\.\d+$/.test(release.version) && !release.lts?.includes?.("Maintenance"),
);
if (![pnpmversion, npmversion, bunversion].every((version) => /^\d+\.\d+\.\d+$/.test(version ?? "")))
  throw new Error("The npm registry did not provide a stable npm, pnpm or Bun version.");
if (!lateststable) throw new Error("The Node release index did not provide a stable release.");
/* the node baseline follows the container image availability: the official node images publish
   behind the nodejs.org releases, so the ladder walks the stable line back to the newest release
   whose pinned bookworm-slim image exists — the runtime baseline the Dockerfile and the verify
   container gate build on. a hub probe that fails open falls back to the newest stable release. */
const stablecandidates = nodeindex.filter(
  (release) => /^v\d+\.\d+\.\d+$/.test(release.version) && !release.lts?.includes?.("Maintenance"),
);
const imageavailable = await (async () => {
  for (const candidate of stablecandidates) {
    const version = candidate.version.slice(1);
    try {
      const response = await fetch(
        `https://hub.docker.com/v2/repositories/library/node/tags/${version}-bookworm-slim`,
      );
      if (response.ok) return candidate;
    } catch {
      /* the hub probe falls through to the next stable candidate */
    }
  }
  return stablecandidates[0] ?? lateststable;
})();
const declarednode = /^>=(\d+)\.\d+\.\d+ <\d+$/.exec(packagejson.engines?.node ?? "")?.[1];
const declarednpm = /^>=(\d+)\.\d+\.\d+ <\d+$/.exec(packagejson.engines?.npm ?? "")?.[1];
const declaredbun = /^>=(\d+)\.\d+\.\d+ <\d+$/.exec(packagejson.engines?.bun ?? "")?.[1];
/* the merged repository carries bun as the root package manager (packageManager: bun@X) while
   pnpm stays the web lane tool: the pnpm baseline reads the workflow pins, not the root field. */
const declaredrootpm = /^bun@(\d+)\./.exec(packagejson.packageManager ?? "")?.[1];
const pnpmpin =
  /pnpm\/action-setup@v\d+\.\d+\.\d+\s*\n(?:.*\n){0,3}?.*version: (\d+\.\d+\.\d+)/.exec(
    await readFile(".github/workflows/verify.yml", "utf8"),
  )?.[1] ?? "11.22.0";
const declaredpnpm = pnpmpin.split(".")[0];
if (!declarednode || !declarednpm || !declaredbun || !declaredrootpm)
  throw new Error("Existing Node, npm, Bun and root package manager declarations must use the expected bounded forms.");
const nodeversion = imageavailable.version.slice(1);
const latestnodemajor = nodeversion.split(".")[0];
const latestnpmmajor = npmversion.split(".")[0];
const latestbunmajor = bunversion.split(".")[0];
const latestpnpmmajor = pnpmversion.split(".")[0];
const nodemajor = allowmajors || latestnodemajor === declarednode ? latestnodemajor : declarednode;
const npmnext =
  allowmajors || latestnpmmajor === declarednpm ? npmversion : packagejson.engines.npm.match(/^>=(\d+\.\d+\.\d+)/)[1];
const bunnext =
  allowmajors || latestbunmajor === declaredbun ? bunversion : packagejson.engines.bun.match(/^>=(\d+\.\d+\.\d+)/)[1];
const pnpmnext = allowmajors || latestpnpmmajor === declaredpnpm ? pnpmversion : pnpmpin;
const next = {
  ...packagejson,
  engines: {
    ...packagejson.engines,
    node: `>=${allowmajors || latestnodemajor === declarednode ? nodeversion : packagejson.engines.node.match(/^>=(\d+\.\d+\.\d+)/)[1]} <${Number(nodemajor) + 1}`,
    npm: `>=${npmnext} <${Number(npmnext.split(".")[0]) + 1}`,
    bun: `>=${bunnext} <${Number(bunnext.split(".")[0]) + 1}`,
  },
  packageManager: `bun@${bunnext}`,
};
/* the workflow renders compose per file: one read, every pin replace applied in sequence — a
   second entry for the same file would resurrect the bytes the first entry retired (the duplicate
   render bug the container image gate caught: the pnpm and bun entries re-read the disk state the
   node entry had already retired, so the file kept the stale baseline the render never composed). */
const nodepin = next.engines.node.match(/^>=(\d+\.\d+\.\d+)/)[1];
const pnmpattern = /(pnpm\/action-setup@v\d+\.\d+\.\d+\s*\n(?:.*\n){0,3}?.*version: )\d+\.\d+\.\d+/;
const bunpattern = /bun-version: \d+\.\d+\.\d+/g;
const workflowpins = [
  [".github/workflows/verify.yml", [[pnmpattern, `$1${pnpmnext}`], [bunpattern, `bun-version: ${bunnext}`]]],
  [
    ".github/workflows/ci.yml",
    [
      [pnmpattern, `$1${pnpmnext}`],
      [/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`],
      [bunpattern, `bun-version: ${bunnext}`],
    ],
  ],
  [
    ".github/workflows/pages.yml",
    [[pnmpattern, `$1${pnpmnext}`], [/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`]],
  ],
  [
    ".github/workflows/security.yml",
    [[pnmpattern, `$1${pnpmnext}`], [/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`]],
  ],
  [".github/workflows/maintenance.yml", [[bunpattern, `bun-version: ${bunnext}`]]],
  [".github/workflows/release.yml", [[bunpattern, `bun-version: ${bunnext}`]]],
  /* the 2.0.16 grouping pass: every post-release lane (the registry publishes, the platform artifacts and the sums umbrella) rides the merged publish.yml - the pins sync the one file */
  [
    ".github/workflows/publish.yml",
    [
      [pnmpattern, `$1${pnpmnext}`],
      [/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`],
      [bunpattern, `bun-version: ${bunnext}`],
    ],
  ],
];
const edits = [
  ["package.json", `${JSON.stringify(next, null, 2)}\n`],
  [".nvmrc", `${nodepin}\n`],
  [
    "Dockerfile",
    (await readFile("Dockerfile", "utf8"))
      .replace(
        /FROM node:\d+(?:\.\d+){0,2}-bookworm-slim/,
        `FROM node:${nodepin}-bookworm-slim`,
      )
      /* the merged Dockerfile pins the baseline through the NODE_IMAGE arg the stages share */
      .replace(/ARG NODE_IMAGE="node:\d+(?:\.\d+){0,2}-bookworm-slim"/, `ARG NODE_IMAGE="node:${nodepin}-bookworm-slim"`),
  ],
  ...(await Promise.all(
    workflowpins.map(async ([file, replaces]) => {
      let content = await readFile(file, "utf8");
      for (const [pattern, replacement] of replaces) content = content.replace(pattern, replacement);
      return [file, content];
    }),
  )),
];
let drift = false;
for (const [path, rendered] of edits) {
  const current = await readFile(path, "utf8");
  if (current !== rendered) {
    drift = true;
    if (mode === "sync") await writeFile(path, rendered);
  }
}
if (drift && mode === "check")
  throw new Error("Maintenance metadata is outdated. Run pnpm sync:maintenance in a review branch.");
console.log(
  JSON.stringify(
    {
      mode,
      allowmajors,
      node: next.engines.node,
      npm: next.engines.npm,
      bun: next.engines.bun,
      pnpm: pnpmnext,
      skippedMajors: {
        node: latestnodemajor !== declarednode && !allowmajors,
        npm: latestnpmmajor !== declarednpm && !allowmajors,
        bun: latestbunmajor !== declaredbun && !allowmajors,
        pnpm: latestpnpmmajor !== declaredpnpm && !allowmajors,
      },
      drift,
    },
    null,
    2,
  ),
);
