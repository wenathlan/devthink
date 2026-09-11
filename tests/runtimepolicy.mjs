/** Ensures all declared runtime baselines remain internally consistent and bounded to explicitly tested major lines. */
import { readFile } from "node:fs/promises";

const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const nvmversion = (await readFile(".nvmrc", "utf8")).trim();
const containerfile = await readFile("Dockerfile", "utf8");
const verifyworkflow = await readFile(".github/workflows/verify.yml", "utf8");
const semver = /^\d+\.\d+\.\d+$/;

/* the 1.1.91 protocolv2 negotiation paths: the runtime baselines accept the frozen protocol major, the library pin and the mcp negotiation seam */
const versionsource = await readFile("version.ts", "utf8");
const typesource = await readFile("types.ts", "utf8");
const mcpsource = await readFile("mcp.ts", "utf8");
if (!/export const protocolmajor = 2 as const;/.test(versionsource))
  throw new Error("version.ts must pin the frozen protocolv2 major two.");
if (!/export const protocolfloormajor = 2 as const;/.test(versionsource))
  throw new Error(
    "version.ts must pin the protocol floor two the 2.0.0 sunset raised when the deprecation window closed.",
  );
if (!typesource.includes("export const protocolmajorversion = protocolmajor;"))
  throw new Error("types.ts must derive the protocol major constant from version.ts.");
if (!typesource.includes("export const pinnedprotocolversion"))
  throw new Error("The library surface must export the pinned protocol version import.");
if (!mcpsource.includes("negotiateprotocol"))
  throw new Error("The mcp negotiation must route through the protocolv2 negotiation family.");
if (!verifyworkflow.includes("node tests/apifreeze.mjs"))
  throw new Error("The verify workflow must gate the api freeze after the validation chain.");

/* the 1.1.95 transparency surface acceptance: the one web design file declares the transparencypage surface with its completed sections, the options surface embeds it as its own page, the surface carries no remote resource, and the compiled page module ships beside the design */
const webindex = await readFile("web/design.html", "utf8");
const transparencymatch = /<template data-surface="transparencypage">([\s\S]*?)<\/template>/.exec(webindex);
if (transparencymatch === null)
  throw new Error(
    "The web design file must declare the transparencypage surface template the transparency page renders from.",
  );
for (const section of [
  "#grants",
  "#windows",
  "#permissions",
  "#datakinds",
  "#integrity",
  "#senders",
  "#permdiffs",
  "#safedefaults",
]) {
  if (!transparencymatch[1].includes(`id="${section.slice(1)}"`))
    throw new Error(
      `The transparencypage surface must carry its ${section} section; the transparency page lists grants, permissions, data kinds, integrity, senders, permdiffs and safedefaults.`,
    );
}
for (const reference of [...transparencymatch[1].matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(
  (match) => match[1],
)) {
  if (/^(https?|wss?|data):/i.test(reference))
    throw new Error(
      `The transparencypage surface loads the remote resource ${reference}; the transparency page runs entirely offline.`,
    );
}
const optionsmatch = /<template data-surface="optionspage">([\s\S]*?)<\/template>/.exec(webindex);
if (optionsmatch === null || !optionsmatch[1].includes('iframe src="transparencypage.html"'))
  throw new Error(
    "The optionspage surface must embed the transparencypage.html surface the manifest declares as an extension page.",
  );
const transparencymodule = await readFile("web/transparencypage.ts", "utf8");
if (!transparencymodule.includes("request<{ transparencyview }") && !transparencymodule.includes("transparencyview"))
  throw new Error("The transparencypage module must render through the transparency view the background serves.");
for (const gate of ["runtimepolicy", "pentest", "cspaudit", "permdiff"]) {
  if (!(await readFile(`tests/${gate}.mjs`, "utf8").catch(() => undefined)))
    throw new Error(`The ${gate} gate script must exist under tests/ beside the runtime policy.`);
}

/* the 1.1.96 multi agent certification acceptance: the coordination and accounting gate scripts exist beside the runtime policy, the verify workflow runs them after the security gates, the dashdone family module ships with its own declaration entry outside the frozen index surface, and the dashboardpage surface of the one web design file carries every multi agent panel with no remote resource */
for (const gate of ["agentcert", "costcert"]) {
  if (!(await readFile(`tests/${gate}.mjs`, "utf8").catch(() => undefined)))
    throw new Error(`The ${gate} gate script must exist under tests/ beside the runtime policy.`);
  if (!verifyworkflow.includes(`node tests/${gate}.mjs`))
    throw new Error(`The verify workflow must run the ${gate} gate of the multi agent certification.`);
}
if (!(await readFile("dashdone.ts", "utf8").catch(() => undefined)))
  throw new Error("The dashdone family module must exist at the root beside the hardening family.");
const dashdonedeclaration = await readFile("tsconfig.build.json", "utf8");
if (!dashdonedeclaration.includes("dashdone.ts"))
  throw new Error(
    "The declaration emit must include the dashdone module so dist/dashdone.d.ts ships beside the bundle.",
  );
const dashboardmatch = /<template data-surface="dashboardpage">([\s\S]*?)<\/template>/.exec(webindex);
if (dashboardmatch === null)
  throw new Error("The web design file must declare the dashboardpage surface template the newtab override serves.");
for (const panel of [
  "multiagentoverview",
  "agentstatuscards",
  "sharedqueueview",
  "queuelanefilter",
  "messageflow",
  "conflictlog",
  "agentcostpanel",
  "escalationinbox",
  "timelinescrubber",
  "aggregatetimeline",
  "killswitch",
  "reportdownload",
]) {
  if (!dashboardmatch[1].includes(`id="${panel}"`))
    throw new Error(
      `The dashboardpage surface must carry its ${panel} multi agent panel; the dashdone completion ships every panel or none.`,
    );
}
for (const reference of [...dashboardmatch[1].matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(
  (match) => match[1],
)) {
  if (/^(https?|wss?|data):/i.test(reference))
    throw new Error(
      `The dashboardpage surface loads the remote resource ${reference}; the multi agent dashboard runs entirely offline.`,
    );
}

function minimum(range, label) {
  const match = /^>=(\d+\.\d+\.\d+) <(\d+)$/.exec(range ?? "");
  if (!match || !semver.test(match[1]))
    throw new Error(`${label} must use a bounded >=x.y.z <next-major engine range.`);
  const major = Number(match[1].split(".")[0]);
  if (Number(match[2]) !== major + 1) throw new Error(`${label} must stop before its next untested major.`);
  return match[1];
}

const nodeversion = minimum(packagejson.engines?.node, "Node");
const npmversion = minimum(packagejson.engines?.npm, "npm");
const bunversion = minimum(packagejson.engines?.bun, "Bun");
if (nvmversion !== nodeversion)
  throw new Error(`.nvmrc (${nvmversion}) must equal the declared Node minimum (${nodeversion}).`);
/* the 2.0.14 family container splits the baseline in two: the build stages
   (deps, builder, binary-builder) ride the exact declared Node baseline on
   the bookworm slim line under --platform=$BUILDPLATFORM so their toolchain
   layers stay native on every leg, the binary-runtime leg rides the
   distroless cc base, and the runtime stage rides the NODE_RUNTIME_IMAGE
   trixie slim line — the only 26.8.x slim tag whose manifest still answers
   all four published architectures (26.8.2 dropped s390x in every variant,
   an upstream build gap; bookworm never carried it). */
if (!new RegExp(`^ARG NODE_IMAGE="node:${nodeversion}-bookworm-slim"$`, "m").test(containerfile))
  throw new Error("the Dockerfile NODE_IMAGE arg must pin the exact declared Node baseline.");
if (!new RegExp(`^ARG NODE_RUNTIME_IMAGE="node:\\d+\\.\\d+\\.\\d+-trixie-slim"$`, "m").test(containerfile))
  throw new Error("the Dockerfile NODE_RUNTIME_IMAGE arg must pin a trixie slim runtime baseline.");
const runtimepin = /^ARG NODE_RUNTIME_IMAGE="node:(\d+)\.\d+\.\d+-trixie-slim"$/m.exec(containerfile);
if (!runtimepin || Number(runtimepin[1]) !== Number(nodeversion.split(".")[0]))
  throw new Error("the Dockerfile NODE_RUNTIME_IMAGE major must equal the declared Node baseline major.");
if (!new RegExp(`^FROM --platform=\\$BUILDPLATFORM \\$\\{NODE_IMAGE\\} AS (?:deps|builder|binary-builder)$`, "m").test(containerfile))
  throw new Error("the Dockerfile build stages must build from the pinned NODE_IMAGE baseline under the build platform.");
if (!new RegExp(`^FROM gcr\\.io/distroless/cc-debian12:nonroot AS binary-runtime$`, "m").test(containerfile))
  throw new Error("the binary runtime stage must ride the distroless cc nonroot base.");
if (!new RegExp(`^FROM \\$\\{NODE_RUNTIME_IMAGE\\} AS runtime$`, "m").test(containerfile))
  throw new Error("the Dockerfile runtime stage must build from the pinned NODE_RUNTIME_IMAGE baseline.");
if (containerfile.includes("corepack"))
  throw new Error("Node 26 container builds must not depend on the removed Corepack binary.");
if (!containerfile.includes("node -p \"require('./package.json')"))
  throw new Error("the Dockerfile must evaluate package metadata with Node rather than pass it as a quoted literal.");
if (!containerfile.includes('npm install --global "bun@${bunversion}"'))
  throw new Error("the Dockerfile must install the root package manager from the canonical packageManager field.");
if (!containerfile.includes("bun install --frozen-lockfile"))
  throw new Error("the Dockerfile must retain frozen-lockfile installation.");
if (!verifyworkflow.includes(`bun-version: ${bunversion}`))
  throw new Error("verify workflow must smoke-test the declared Bun baseline.");
if (!/^bun@\d+\.\d+\.\d+$/.test(packagejson.packageManager ?? ""))
  throw new Error("packageManager must pin a full bun version.");
console.log(
  JSON.stringify(
    {
      node: nodeversion,
      npm: npmversion,
      bun: bunversion,
      pnpm: packagejson.packageManager,
      protocolmajor: 2,
      protocolfloor: 2,
    },
    null,
    2,
  ),
);
