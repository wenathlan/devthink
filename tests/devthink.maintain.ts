/** Proposes current stable runtimes from official registries without silently crossing a major compatibility boundary. */
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { familylanes } from "./devthink.familylanes.ts";
import { releasepat } from "./devthink.releasepat.ts";

const repoRoot = resolve(process.cwd(), "..");
const mode = process.argv[2] ?? "check";
if (!new Set(["check", "sync"]).has(mode)) throw new Error("Use check or sync.");
const allowmajors = process.argv.includes("--allow-majors");
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
/** One release entry of the nodejs.org distribution index the ladder walks. */
interface noderelease {
  version: string;
  lts?: string;
}
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
  (release: noderelease) => /^v\d+\.\d+\.\d+$/.test(release.version) && !release.lts?.includes?.("Maintenance"),
);
if (![pnpmversion, npmversion, bunversion].every((version) => /^\d+\.\d+\.\d+$/.test(version ?? "")))
  throw new Error("The npm registry did not provide a stable npm, pnpm or Bun version.");
if (!lateststable) throw new Error("The Node release index did not provide a stable release.");
/* the node baseline follows the container image availability: the official node images publish
   behind the nodejs.org releases, so the ladder walks the stable line back to the newest release
   whose pinned bookworm-slim image exists — the runtime baseline the Dockerfile and the verify
   container gate build on. a hub probe that fails open falls back to the newest stable release. */
const stablecandidates = nodeindex.filter(
  (release: noderelease) => /^v\d+\.\d+\.\d+$/.test(release.version) && !release.lts?.includes?.("Maintenance"),
);
const imageavailable = await (async () => {
  for (const candidate of stablecandidates) {
    const version = candidate.version.slice(1);
    try {
      const response = await fetch(`https://hub.docker.com/v2/repositories/library/node/tags/${version}-bookworm-slim`);
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
  /pnpm\/action-setup@.*\s*?\r?\n(?:.*\r?\n){0,3}?.*version: (\d+\.\d+\.\d+)/.exec(
    await readFile(join(repoRoot, ".github/workflows/verify.yml"), "utf8"),
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
const pnmpattern = /(pnpm\/action-setup@.*\s*?\r?\n(?:.*\r?\n){0,3}?.*version: )\d+\.\d+\.\d+/;
const bunpattern = /bun-version: \d+\.\d+\.\d+/g;
const workflowpins: [string, [RegExp, string][]][] = [
  [
    join(repoRoot, ".github/workflows/verify.yml"),
    [
      [pnmpattern, `$1${pnpmnext}`],
      [bunpattern, `bun-version: ${bunnext}`],
    ],
  ],
  [
    join(repoRoot, ".github/workflows/ci.yml"),
    [
      [pnmpattern, `$1${pnpmnext}`],
      [/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`],
      [bunpattern, `bun-version: ${bunnext}`],
    ],
  ],
  [
    join(repoRoot, ".github/workflows/pages.yml"),
    [
      [pnmpattern, `$1${pnpmnext}`],
      [/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`],
    ],
  ],
  [
    join(repoRoot, ".github/workflows/security.yml"),
    [
      [pnmpattern, `$1${pnpmnext}`],
      [/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`],
    ],
  ],
  [join(repoRoot, ".github/workflows/maintenance.yml"), [[bunpattern, `bun-version: ${bunnext}`]]],
  [join(repoRoot, ".github/workflows/release.yml"), [[bunpattern, `bun-version: ${bunnext}`]]],
  /* the 2.0.128 node standardization wave: the family lanes join the pin
     surface — the desktop and mobile lanes of the family carry the same
     node pin every other lane answers (the bun and pnpm pins of those
     lanes stay deliberate: each leg installs against the lockfile its
     package manager generated, so the ladder walks the node pin alone) */
  [
    join(repoRoot, ".github/workflows/family-desktop.yml"),
    [[/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`]],
  ],
  [
    join(repoRoot, ".github/workflows/family-mobile.yml"),
    [[/node-version: \d+\.\d+\.\d+/g, `node-version: ${nodepin}`]],
  ],
  /* the 2.0.16 grouping pass: every post-release lane (the registry publishes, the platform artifacts and the sums umbrella) rides the merged publish.yml - the pins sync the one file */
  [
    join(repoRoot, ".github/workflows/publish.yml"),
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
  /* the 2.0.128 node standardization wave: the family envelopes and the
     monorepo root answer the one node declaration the ladder pins — the
     engines floors walk with the os engines (the bounded form, one version
     family wide) and the member .nvmrc files carry the same pin the os
     .nvmrc carries, so no application of the repository ever answers a
     node the os retired. The engines walk replaces the first node key of
     each envelope (the engines block sits before every other node
     occurrence in every manifest of the family). */
  ...(await Promise.all(
    ["argan", "cadria", "debonair", "stealthhead", "forge", "foundry", "vault", "getry", "saddle", "cobaia"].map(
      async (app) => {
        const file = join(repoRoot, app, "package.json");
        return [file, (await readFile(file, "utf8")).replace(/"node": "[^"]+"/, `"node": "${next.engines.node}"`)];
      },
    ),
  )),
  ...["argan", "cadria", "debonair", "stealthhead", "forge", "foundry", "vault", "getry", "saddle"].map((app) => [
    join(repoRoot, app, ".nvmrc"),
    `${nodepin}\n`,
  ]),
  [
    join(repoRoot, "package.json"),
    (await readFile(join(repoRoot, "package.json"), "utf8")).replace(
      /"node": "[^"]+"/,
      `"node": "${next.engines.node}"`,
    ),
  ],
  /* the 2.0.133 publish regression lane: the saddle engineversions anchor
     (the nodecurrent the dumpstate probe advertises) walked nowhere — the
     rung stamped the pins and the engine kept answering a node the
     repository retired, so the publish gate of the saddle extension went
     red on the strict-equality assertion. the anchor now rides the pin
     lane: every future rung walks it with the .nvmrc, and the test suite
     derives both sides from the pin so drift answers red in the gate,
     never in the publish lane again */
  [
    join(repoRoot, "saddle", "orchestrator.ts"),
    (await readFile(join(repoRoot, "saddle", "orchestrator.ts"), "utf8")).replace(
      /nodecurrent: '\d+(?:\.\d+){0,2}'/,
      `nodecurrent: '${nodepin}'`,
    ),
  ],
  /* the saddle ledger twin: index.ts exports the same engineversions map
     the orchestrator cites (every module reads the one ledger), so the
     nodecurrent anchor walks both carriers — a rung that stamps only one
     leaves the suite's strict-equality assertion red on the twin */
  [
    join(repoRoot, "saddle", "index.ts"),
    (await readFile(join(repoRoot, "saddle", "index.ts"), "utf8")).replace(
      /nodecurrent: '\d+(?:\.\d+){0,2}'/,
      `nodecurrent: '${nodepin}'`,
    ),
  ],
  [
    "Dockerfile",
    (await readFile("Dockerfile", "utf8"))
      .replace(/FROM node:\d+(?:\.\d+){0,2}-bookworm-slim/, `FROM node:${nodepin}-bookworm-slim`)
      /* the merged Dockerfile pins the baseline through the NODE_IMAGE arg the stages share */
      .replace(
        /ARG NODE_IMAGE="node:\d+(?:\.\d+){0,2}-bookworm-slim"/,
        `ARG NODE_IMAGE="node:${nodepin}-bookworm-slim"`,
      )
      /* the runtime version arg walks with the same pin: the nodefetch stage
         extracts the tarball of the exact baseline the .nvmrc carries, and the
         containerpack and runtimepolicy gates read the arg against it — the
         2.0.133 rung exposed the lane was missing (the arg stayed 26.12.0
         while every other pin walked to 26.12.1 and the validation refused
         the rung) */
      .replace(/ARG NODE_RUNTIME_VERSION="\d+(?:\.\d+){0,2}"/, `ARG NODE_RUNTIME_VERSION="${nodepin}"`),
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
/* The 2.0.128 family lane migration rides the same vehicle (the 300+ assets
   doctrine): the lane walk runs AFTER the pin renders above so the canonical
   body the migration writes never meets a stale render re-writing over it,
   and only the sync mode walks it — the check gate answers the pins and the
   engines floors it owns (the one-shot structural migration carries its own
   standalone check beside this module), so a push that ships the vehicle
   never reddens the gate waiting for the rung that lands the lanes. The
   workflow files it touches answer the maintenance sync the same way — the
   GH013 wall refuses any workflow file through the repository token, so the
   ladder's owner PAT landing is the only door the release doctrine walks
   through. The migration is one-shot: once the lane markers answer, this
   walk reports no drift ever again and the mutable pins answer to the render
   passes above alone. */
const lanes = mode === "sync" ? await familylanes(mode) : { drift: false, desktop: "unchecked", mobile: "unchecked" };
if (lanes.drift) drift = true;
/* the release publish doctrine walks the same one-shot door: the owner pat
   rides the release create and the publish flip (the family artifact lanes
   answer the published event a repository token never fires), the sync
   renders the forms over the old ones, and the standing checks never
   redden waiting for the rung that lands them — the walk answers sync only,
   the familylanes pattern, and once both markers answer the pat form the
   walk reports no drift ever again. */
const patwalk = mode === "sync" ? await releasepat(mode) : { drift: false, create: "unchecked", flip: "unchecked" };
if (patwalk.drift) drift = true;
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
      familylanes: { desktop: lanes.desktop, mobile: lanes.mobile },
      releasepat: { create: patwalk.create, flip: patwalk.flip },
      drift,
    },
    null,
    2,
  ),
);
