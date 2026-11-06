/** Builds browser and library targets with no remote runtime dependencies —
 * and, since the build family consolidation, the one build file of the root:
 * the former buildbinary/buildlib/buildresearchcatalog/buildusercatalog/
 * buildterminal lanes ride this same file behind argv[2] lane words (binary,
 * lib, researchcatalog, usercatalog, terminal), each section carrying its
 * source verbatim below the root build body, while `node build.ts` with no
 * lane word keeps answering the root build exactly the way CI runs it. */
import { execFile, execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { arch, platform } from "node:process";
import path, { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { build } from "esbuild";
import type { platformtarget } from "./types.ts";
import { stripstrings, underscorednames } from "../foundry/bundlescan.ts";
import { cjswrap } from "./cjswrap.ts";
import {
  changelogdigestworkflow,
  cjssample,
  exampleorgpagestate,
  forminventoryplan,
  formsurveyworkflow,
  releasenotesplan,
} from "./test/fixtureset.ts";
import { bunshellexample, denoshellexample, mcpclientexample } from "./test/codefixtures.ts";
import { importersamples } from "./test/importerfixtures.ts";
import { fixturepages, umdexample } from "./test/pagefixtures.ts";
import { gallery as gallerytext, recipeplans } from "./test/recipesfixtures.ts";
import { frozenschemas } from "./test/schemafixtures.ts";
import { pxToCellX, pxToCellY } from "./dashboard.ts";
import { umdwrap } from "./umdwrap.ts";
import type { IrNode } from "./runtime.ts";

/* ─── the build family lanes (the flat folder law: one keyword file per
   domain) — argv[2] names the lane a merged build rides; no lane word runs
   the root build exactly the way CI does (`node build.ts`), a lane word
   runs that lane alone, and an import of this module (the terminal test
   battery reads the converter exports) never trips either. ─── */
const buildlanes = new Set(["binary", "lib", "researchcatalog", "usercatalog", "terminal"]);
const buildlane = process.argv[2];
const buildentry =
  !buildlanes.has(buildlane ?? "") &&
  (process.argv[1]?.endsWith("build.ts") ||
    process.argv[1]?.endsWith("build") ||
    (import.meta as ImportMeta & { main?: boolean }).main === true);
if (buildentry) {

/** The built bundles import by absolute path: the file URL keeps the import legal on every platform (the windows drive letter is not a URL scheme). */
const importbundle = (bundlepath: string) => import(pathToFileURL(bundlepath).href);

/** Resolves the repo-local tsc bin (the merged repo rides bun; pnpm exec is retired). */
async function resolveTsc() {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const self = require.resolve("typescript/package.json");
  const path = await import("node:path");
  return path.join(path.dirname(self), "bin", "tsc");
}

const root = process.cwd();
const extensiondist = join(root, "build", "extension");
const execute = promisify(execFile);
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
await rm(join(root, "build"), { recursive: true, force: true });
await rm(extensiondist, { recursive: true, force: true });
await mkdir(extensiondist, { recursive: true });

/** The version stamp and license banner every bundle embeds: the version reads from package.json so no bundle carries a second version source, and the license name rides the same line. */
const banner = `/*! devthink ${packagejson.version} — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/devthink */`;

/** The byte budget of every build target: the bounds are build-time engineering bounds on the unminified variants (a minified variant stays strictly smaller than its unminified bundle) and an overgrown bundle fails the build before it ships. The grand merge consolidation interned the provider gateway adapters in the llm core surface, and the logicfold waves interned the page bridge, the umd and cjs families beside the keyed os seat, so the index family bounds ride one notch above the pre-merge engineering ceilings the surface outgrew. */
const bundlebudgets: Record<string, number> = {
  index: 2_500_000,
  indexcjs: 2_600_000,
  neutral: 2_400_000,
  umd: 2_600_000,
  node: 2_600_000,
  bun: 2_500_000,
  deno: 2_500_000,
  cli: 900_000,
  headless: 900_000,
  mcp: 1_400_000,
  server: 2_600_000,
  http: 600_000,
  bridge: 160_000,
  companion: 60_000,
  policy: 600_000,
  protocol: 380_000,
  memory: 500_000,
  progress: 60_000,
  hardening: 60_000,
  dashboard: 120_000,
  queue: 160_000,
  crossbrowser: 380_000,
  pack: 600_000,
};

/** Every build bundle the build emits: the accounting, the naming check, the checksums file and the minified parity expectations read this one list. */
const emitted: string[] = [];

/** Records one emitted build bundle: the list drives the size accounting, the naming check and the checksums file of every target. */
function record(name: string) {
  emitted.push(name);
  return join("build", name);
}

/** The shared core: one tree shakable esm entry every runtime re-exports, the cjs entry behind the stable getter object, the neutral browser bundle the browser condition selects, and one per module bundle for the policy, protocol, memory and progress module entries — every target with its minified variant beside it. */
await build({
  entryPoints: ["index.ts"],
  outfile: record("index.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["index.ts"],
  outfile: record("index.min.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});

/** The cjs mode: the build emits the core once, wraps the named exports behind the stable getter object and keeps the mode stamp the entry carries, so require consumers read the same surface the esm mode reads. */
await build({
  entryPoints: ["cjs.ts"],
  outfile: join(root, "build", "index.cjs"),
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node22",
  sourcemap: true,
  banner: { js: banner },
});
await writeFile(record("index.cjs"), cjswrap(await readFile(join(root, "build", "index.cjs"), "utf8")), "utf8");
await build({
  entryPoints: ["cjs.ts"],
  outfile: join(root, "build", "index.min.cjs"),
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node22",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});
await writeFile(record("index.min.cjs"), cjswrap(await readFile(join(root, "build", "index.min.cjs"), "utf8")), "utf8");

/** The neutral target the browser condition selects: the browser platform build strips every node import because the whole core reaches the platform through the adapter seam, never through a direct import. */
await build({
  entryPoints: ["neutral.ts"],
  outfile: record("index.neutral.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "chrome120",
  sourcemap: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["neutral.ts"],
  outfile: record("index.neutral.min.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "chrome120",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});

/** The per module bundles of the exports map: policy, protocol, memory and progress ship as their own tree shakable entries with the types the declaration emit provides, the 1.1.95 hardening family ships its own entry beside them so the security gates stay importable without touching the frozen index surface, and the 1.1.96 dashdone family ships its own entry the same way so the multi agent dashboard view stays importable outside the frozen surface — the seat answers the dashboard keyword file since the wave consolidation folded dashdone.ts, desktopstate.ts, alttab.ts and density.ts into dashboard.ts, and the lazy storage.ts preference lane the desktopstate section carries stays external exactly as lazy as it rode in its standalone era (the flat package answers the account store through its own ./storage seam; a lane that cannot resolve answers the honest floating default the pure layer always kept). */
for (const modulename of ["policy", "protocol", "memory", "progress", "hardening", "dashboard"]) {
  const modulexternals = modulename === "dashboard" ? ["./storage.ts"] : [];
  await build({
    entryPoints: [`${modulename}.ts`],
    outfile: record(`${modulename}.js`),
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    sourcemap: true,
    banner: { js: banner },
    external: modulexternals,
  });
  await build({
    entryPoints: [`${modulename}.ts`],
    outfile: record(`${modulename}.min.js`),
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    sourcemap: true,
    minify: true,
    banner: { js: banner },
    external: modulexternals,
  });
}

/* the prisma client generates before the declaration emit: the database module imports the
   PrismaClient the generated .prisma/client tree declares, and a fresh install carries the
   stub until the generate step runs (the gateway lineage's build always generated first). */
await execute(process.execPath, [join(root, "node_modules", "prisma", "build", "index.js"), "generate"], { cwd: root });

/* the gateway declaration face generates before the declaration emit: the ownership wave
   (wave/ownership.getry) moved the gateway modules to the getry owner, and the build config
   resolves every @wenathlan/getry/* specifier to the owner's generated declaration face
   (getry/dist/types, the emit of the owner's tsconfig.types.json) so the owner source never
   enters this program and the emit stays flat — the face regenerates here exactly the way
   the prisma client generates above (idempotent: a warm face re-emits in place). */
await execute(process.execPath, [await resolveTsc(), "-p", join("..", "getry", "tsconfig.types.json")], { cwd: root });

/* the ownership bridge of the thinking ladder: the getry engine owns the 7-level ladder and
   the os consumes it as a library — the declaration emit reads the owner's committed public
   types (getry/thinking.ts, the declaration surface the path table of the build config
   carries, so the owner source never enters the program and the emit stays flat), while the
   runtime resolves the specifier through this node_modules link the same way the flat gate
   tree resolves its packages through the application node_modules (the tests village folded
   the gates and the suite into the application tree, so the ci link the former root tests
   folder carried retired with it): the dev servers the suites spawn and every tsx entry
   import the owner source directly, and the esbuild lanes keep inlining the ladder through
   the getrybridge alias — the link is the dev-time answer alone, never a committed
   dependency, so the lockfile never changes. */
{
  const ownerlink = join(root, "node_modules", "@wenathlan", "getry");
  if (!existsSync(ownerlink)) {
    await mkdir(join(root, "node_modules", "@wenathlan"), { recursive: true });
    const ownerpath = relative(join(root, "node_modules", "@wenathlan"), join(root, "..", "getry"));
    await symlink(ownerpath, ownerlink, "dir");
  }
}
await execute(process.execPath, [await resolveTsc(), "-p", "tsconfig.build.json"]);

/** The terminal and headless entries of the 1.1.80 family keep their own build targets beside the library modes, with the minified variants and the version banner riding the same accounting; the mcp server bundle of the 1.1.84 family serves the model context protocol surface of the serve mode as its own tree shakable entry, and the native bundles of the 1.1.85 family ship beside them: the wsbridge module bundle and the companion script the plain node recipe stamps from the companion sources. */
await build({
  entryPoints: ["cli.ts"],
  outfile: record("cli.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  banner: { js: `#!/usr/bin/env node\n${banner}` },
});
await build({
  entryPoints: ["cli.ts"],
  outfile: record("cli.min.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  minify: true,
  banner: { js: `#!/usr/bin/env node\n${banner}` },
});
await build({
  entryPoints: ["headless.ts"],
  outfile: record("headless.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["headless.ts"],
  outfile: record("headless.min.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["mcp.ts"],
  outfile: record("mcp.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["mcp.ts"],
  outfile: record("mcp.min.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});

/** The bridge bundle of the 1.1.90 correlation wave: the native host bridge family — the wire contract, the site relay client, the chat widget, the localhost wsbridge relay and the native host surface — ships as one tree shakable entry with the minified variant beside it, so a local process imports the server contract, the relay, the chat bridge, the bind checks, the session tokens, the envelope translation, the port states, the handshake, the capability negotiation and the frame validation from one artifact. */
await build({
  entryPoints: ["bridge.ts"],
  outfile: record("bridge.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["bridge.ts"],
  outfile: record("bridge.min.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});

/** The cross browser bundles of the 1.1.86 browser coverage family: the webextension api map the gateway entry carried ships through the crossbrowser family entry, and the 1.1.90 correlation wave folds the polyfill layer, the firefoxprep adapter, the xpipack assembler and the safariskeleton wrapper into the one crossbrowser family entry with the minified variants beside them, so a local process imports the catalog, the namespace resolver, the firefox overlay adapter, the xpi assembler and the safari wrapper from one artifact beside the native bridge bundles. */
await build({
  entryPoints: ["crossbrowser.ts"],
  outfile: record("crossbrowser.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["crossbrowser.ts"],
  outfile: record("crossbrowser.min.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});
/** The server library entry of the grand merge consolidation: the gateway lineage library surface (the embedded gateway http transport, the request auth, the console cli and the library barrel) and the maene lineage barrel (the provider account console, the provider family namespaces and the opencode server plugin entry) interned in server.ts — one tree shakable entry answers the whole server surface contract, so the ./server subpath resolves from the flat package exactly like every other entry. The runtime dependencies the gateway persistence and the hono server pull (the prisma stack, libsql, hono, the node adapter, ink and react) ride the package.json dependencies of the published artifact — the entry marks them external so the bundled code stays the reviewed repository sources alone and the dependency tree the consumer installs answers the rest. The thinking ladder rides the ownership law instead (pr16): the 7-level ladder is owned by the getry engine and the os consumes it as a library, so the server builds resolve the @wenathlan/getry/thinking specifier to the sibling owner source through the getrybridge alias — the same bridge the vite, vitest and tsconfig resolutions carry — and the bundle inlines the owner's rungs at build time (the generated build tree is a build artifact, never a second source of truth; the lockfile stays untouched because no registry dependency is declared). */
const familybridges = {
  /** the saddle owner bridge of the modality ladder (wave/engineregroup1):
   * the sandbox lane reads the ninety-modality catalog through the
   * published specifier and the bundle inlines the owner's real source —
   * the catalog values (the records, the census) are runtime data, so the
   * alias answers the saddle root exactly like the getry siblings (never a
   * copy inside devthink: the owner source answers at build time; the
   * typecheck programs keep answering the saddlefaces typed face). */
  "@wenathlan/saddle/modalityregistry": join(root, "..", "saddle", "modalityregistry.ts"),
  "@wenathlan/getry/thinking": join(root, "..", "getry", "thinking.ts"),
  /** the getry engine module bridges of the ownership wave
   * (wave/ownership.getry): the gateway pipeline sources (engine, llm,
   * streaming, models, request, providers, antigravity, oauth, accounts,
   * project, quota, recovery, fingerprint, search, utils,
   * versionregistry, intelligence, the json family, the gateway config
   * family, the smoke and probe lanes, the node shim and the shared
   * types/constants surfaces) moved from the devthink root to the getry
   * owner root, and the consumers speak them through the published library
   * specifiers — the server bundle inlines the owner's modules the same
   * way the thinking ladder rides the getry source, the same bridge the
   * vite, vitest and tsconfig resolutions carry, and the lockfile stays
   * untouched because no registry dependency is declared. */
  "@wenathlan/getry/engine": join(root, "..", "getry", "engine.ts"),
  "@wenathlan/getry/llm": join(root, "..", "getry", "llm.ts"),
  "@wenathlan/getry/streaming": join(root, "..", "getry", "streaming.ts"),
  "@wenathlan/getry/models": join(root, "..", "getry", "models.ts"),
  "@wenathlan/getry/request": join(root, "..", "getry", "request.ts"),
  "@wenathlan/getry/providers": join(root, "..", "getry", "providers.ts"),
  "@wenathlan/getry/antigravity": join(root, "..", "getry", "antigravity.ts"),
  "@wenathlan/getry/oauth": join(root, "..", "getry", "oauth.ts"),
  "@wenathlan/getry/accounts": join(root, "..", "getry", "accounts.ts"),
  "@wenathlan/getry/project": join(root, "..", "getry", "project.ts"),
  "@wenathlan/getry/quota": join(root, "..", "getry", "quota.ts"),
  "@wenathlan/getry/recovery": join(root, "..", "getry", "recovery.ts"),
  "@wenathlan/getry/fingerprint": join(root, "..", "getry", "fingerprint.ts"),
  "@wenathlan/getry/search": join(root, "..", "getry", "search.ts"),
  "@wenathlan/getry/utils": join(root, "..", "getry", "utils.ts"),
  "@wenathlan/getry/versionregistry": join(root, "..", "getry", "versionregistry.ts"),
  "@wenathlan/getry/intelligence": join(root, "..", "getry", "intelligence.ts"),
  "@wenathlan/getry/json": join(root, "..", "getry", "json.ts"),
  "@wenathlan/getry/gatewayconfig": join(root, "..", "getry", "gateway.ts"),
  "@wenathlan/getry/gatewayviewconfig": join(root, "..", "getry", "gateway.ts"),
  "@wenathlan/getry/gatewayprobe": join(root, "..", "getry", "gatewayprobe.ts"),
  "@wenathlan/getry/gatewaysmoke": join(root, "..", "getry", "gatewaysmoke.ts"),
  "@wenathlan/getry/nodeshim": join(root, "..", "getry", "nodeshim.ts"),
  "@wenathlan/getry/types": join(root, "..", "getry", "types.ts"),
  "@wenathlan/getry/constants": join(root, "..", "getry", "constants.ts"),
  /** the getry owner faces of the gateway ownership wave
   * (wave/ownership.gateway), mirrored from the vite/vitest/tsconfig
   * resolutions: the embedded gateway surfaces the grand merge interned
   * in server.ts (the http transport server, the request auth family,
   * the console cli and the provider cli) move to the getry owner root
   * one face per step, and the consumers speak them through the
   * published library specifiers — the server bundle INLINES the owner's
   * sources through these aliases exactly the way the engine family
   * rides them (never externalized, never duplicated inside devthink:
   * the reviewed owner source answers at build time), and the lockfile
   * stays untouched because no registry dependency is declared (the auth
   * family landed with step 2; the server, cli and providercli faces
   * land with the steps that follow, their targets answer the day they
   * land). */
  "@wenathlan/getry/server": join(root, "..", "getry", "server.ts"),
  "@wenathlan/getry/auth": join(root, "..", "getry", "auth.ts"),
  "@wenathlan/getry/cli": join(root, "..", "getry", "cli.ts"),
  /** the devthink self bridges of the ownership wave
   * (wave/ownership.getry), mirrored from the vite/vitest/tsconfig
   * resolutions: the moved gateway graph leans on the os-owned seams it
   * grew beside (config, constants, core, the http/memory/policy/security
   * lane, server, storage and the shared types surface) through the
   * published library specifiers, and this app is the package those
   * specifiers name — no node_modules copy exists to answer them — so the
   * server bundle inlines this app's own sources for every self specifier
   * (the @wenathlan/devthink/server reference of the moved engine resolves
   * back to the server entry itself, one module instance). the entries
   * retire when the published devthink envelope carries the export
   * surfaces the moved graph consumes. */
  "@wenathlan/devthink/config": join(root, "config.ts"),
  "@wenathlan/devthink/constants": join(root, "constants.ts"),
  "@wenathlan/devthink/core": join(root, "core.ts"),
  "@wenathlan/devthink/http": join(root, "http.ts"),
  "@wenathlan/devthink/memory": join(root, "memory.ts"),
  "@wenathlan/devthink/policy": join(root, "policy.ts"),
  "@wenathlan/devthink/security": join(root, "security.ts"),
  "@wenathlan/devthink/server": join(root, "server.ts"),
  /* the oslabels self bridge of the provider console move (the gateway
   * ownership wave, step 5): the moved console's barrel reads the paired
   * label catalog through the published os specifier, and the server
   * bundle inlines this app's own source for it the same way the other
   * self specifiers above ride — the catalog is never duplicated inside
   * getry. */
  "@wenathlan/devthink/oslabels": join(root, "os.ts"),
  "@wenathlan/devthink/storage": join(root, "storage.ts"),
  "@wenathlan/devthink/types": join(root, "types.ts"),
  /** the label store bridge of the ownership law: the os copy mechanism rides
   * the vault factory through the published library specifier, and the server
   * bundle inlines the owner's mechanism the same way the thinking ladder
   * rides the getry source — the mechanism is never duplicated inside
   * devthink and the lockfile stays untouched (no registry dependency is
   * declared). retires when the published envelope carries the built label
   * store. */
  "@wenathlan/vault/labelstore": join(root, "..", "vault", "labelstore.ts"),
};
const libraryexternals = [
  "hono",
  "@hono/node-server",
  "@libsql/client",
  "@prisma/client",
  "@prisma/adapter-libsql",
  "ink",
  "react",
  "z-ai-web-dev-sdk",
];
await build({
  entryPoints: ["server.ts"],
  outfile: record("server.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  banner: { js: banner },
  external: libraryexternals,
  alias: familybridges,
});
await build({
  entryPoints: ["server.ts"],
  outfile: record("server.min.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
  external: libraryexternals,
  alias: familybridges,
});

/** The os seam entries the ownership wave (wave/ownership.getry) added to the exports map: the
    moved gateway graph leans on the os-owned seams it grew beside (config, constants, core,
    the data surface, the storage lane, the security lane, the tool catalog and the shared
    types surface) through the published library specifiers ("@wenathlan/devthink/storage" and
    siblings), so the flat package answers every seam the getry owner's published sources
    import. The entries ride the node platform (the config and storage lanes speak the fs and
    the prisma stack), keep the runtime dependencies external exactly the way the server entry
    does, and inline the gateway owner modules through the family bridges the same way — the
    bundle stays the reviewed repository sources alone. */
for (const modulename of ["config", "constants", "core", "data", "os", "graph", "hono", "commands", "engines", "storage", "security", "tools", "types"]) {
  await build({
    entryPoints: [`${modulename}.ts`],
    outfile: record(`${modulename}.js`),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    sourcemap: true,
    banner: { js: banner },
    external: libraryexternals,
    alias: familybridges,
  });
  await build({
    entryPoints: [`${modulename}.ts`],
    outfile: record(`${modulename}.min.js`),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    sourcemap: true,
    minify: true,
    banner: { js: banner },
    external: libraryexternals,
    alias: familybridges,
  });
}

/** The publishing pipeline bundles of the 1.1.87 family: the 1.1.90 correlation wave folds the vsixpack assembler, the mavenpack descriptors, the nugetpack layout, the containerpack stages, the sbom inventory builder and the artifact manifest builder into the one pack family entry, and the relayserve state machine ships beside them with the minified variants beside them, so the release chain and any local tooling import the packaging surfaces from one artifact beside the cross browser bundles. */
for (const modulename of ["pack", "http"]) {
  await build({
    entryPoints: [`${modulename}.ts`],
    outfile: record(`${modulename}.js`),
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    sourcemap: true,
    banner: { js: banner },
  });
  await build({
    entryPoints: [`${modulename}.ts`],
    outfile: record(`${modulename}.min.js`),
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    sourcemap: true,
    minify: true,
    banner: { js: banner },
  });
}

/** The request queue family entry of the exports map: queue.ts — the bounded request queue, the retry backoff discipline, the token estimation, the conversation compaction, the resilient sse parsing and the id minting of the queue family — ships as its own tree shakable entry with the minified variant beside it, so the ./queue subpath resolves from the flat package exactly like every other module entry and the family consumers (the getry gateway of the streaming fallback) ride the published retry.backoff discipline through the library specifier instead of a local copy. */
await build({
  entryPoints: ["queue.ts"],
  outfile: record("queue.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  banner: { js: banner },
});
await build({
  entryPoints: ["queue.ts"],
  outfile: record("queue.min.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});

/** The companionbin bundle of the 1.1.85 native host bridge family: the plain node recipe compiles the companion source of companion.ts with esbuild, stamps the package version over the source build marker and writes the runnable script with its sourcemap beside the host manifest template the same recipe stamps from the template the companion module embeds — no native compiler and no network step — and the packaging step asserts the recipe builds, because the companion ships as source plus a build command and never as a binary blob. */
const companionbanner = `/*! devthink ${packagejson.version} companion — the optional native host of the native bridge — GPL-3.0-only — built with plain node, no native compiler */`;
await build({
  entryPoints: ["companion.ts"],
  outfile: record("companion.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  banner: { js: companionbanner },
});
const companionbundle = await readFile(join(root, "build", "companion.js"), "utf8");
const companionstamped = companionbundle.replace(
  /(const|var|let) companionbuild = "source"/,
  `$1 companionbuild = "${packagejson.version}"`,
);
if (companionstamped === companionbundle)
  throw new Error(
    "The companion build recipe found no source build marker to stamp; the companion keeps its companionbuild export.",
  );
await writeFile(join(root, "build", "companion.js"), companionstamped, "utf8");
const companionmodule = await importbundle(join(root, "build", "companion.js"));
const templatestamped = String(companionmodule.nativehosttemplatejson).replace(
  "__devthink_version__",
  packagejson.version,
);
if (templatestamped === String(companionmodule.nativehosttemplatejson))
  throw new Error(
    "The companion build recipe found no template banner placeholder to stamp; the template keeps its version placeholder.",
  );
await writeFile(record("nativehost.template.json"), templatestamped, "utf8");
console.log(
  `Companion built with plain node: build/companion.js of build ${packagejson.version} with the sourcemap and the stamped host manifest template beside it.`,
);

/** The frozen contract artifacts of the 1.1.98 consolidation: the capability manifests of the seven frozen surfaces, the ten protocol schemas, the example fixture set and the umd example page are build artifacts the recipe derives from the repository sources — the caps come from the frozen lists the compiled library exports, the schemas and the fixtures copy verbatim from the typescript fixture modules of the tests sources (the schemafixtures, fixtureset, importerfixtures, recipesfixtures and pagefixtures modules carry the exact texts of the former test/code corpus), and the umd example rewrites its bundle reference to the build root — so the packages ship them from the staged tree while the repository root stays source only. The 2.0.0 example gallery extends the same fixture set: the 36 recipe plan texts of the recipesfixtures module copy into build/fixtures/recipes as pure plan documents, the four self contained fixture pages of the pagefixtures module copy into build/fixtures/pages, and the gallery index (the metadata the recipes runner and the cli recipes command read) ships as build/gallery.json beside the fixture set — outside the fixtures directory the headless fixture loader scans under schemastrict, so the recipes directory itself stays pure plans the planlint command walks while the index never answers a page state fixture probe. */
const capsurfaces = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
const librarymodule = await importbundle(join(root, "build", "index.js"));
await mkdir(join(root, "build", "caps"), { recursive: true });
for (const surface of capsurfaces) {
  const manifest = librarymodule.capmanifestof(surface);
  if (manifest.release !== packagejson.version)
    throw new Error(
      `The capmanifest of the ${surface} surface pins the release ${manifest.release} while the package carries ${packagejson.version}.`,
    );
  await writeFile(record(`caps/${surface}.json`), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}
const frozenschematexts = frozenschemas as Record<string, string>;
const schemefiles = Object.keys(frozenschematexts).sort();
if (schemefiles.length !== 10)
  throw new Error(
    `The protocol schema set of the schemafixtures module carries the ten frozen schemas, found ${schemefiles.length}.`,
  );
await mkdir(join(root, "build", "schemas"), { recursive: true });
for (const name of schemefiles)
  await writeFile(record(`schemas/${name}.schema.json`), frozenschematexts[name], "utf8");
/** The fixture text table of the typescript fixture modules keyed by the original test/code source names: every fixture of the former corpus answers from its family module (the example fixture set, the importer samples, the recipe plans with the gallery index, the fixture pages with the umd example and the three typescript example scripts — the mcp client, the bun shell and the deno shell — of the code fixture module), so the fixtureset rows below keep their source names while every text comes from the modules; the flat typed folder law dissolved the test/code directory, so a fixture the table misses answers an explicit error instead of a read from a retired path. */
const modulefixtures: Record<string, string> = {
  "example-org-pagestate.json": exampleorgpagestate,
  "mcp.client.ts": mcpclientexample,
  "bun.ts": bunshellexample,
  "deno.ts": denoshellexample,
  "cjs.js": cjssample,
  "form-inventory-plan.json": forminventoryplan,
  "release-notes-plan.json": releasenotesplan,
  "changelog-digest-workflow.json": changelogdigestworkflow,
  "form-survey-workflow.json": formsurveyworkflow,
  "umd.html": umdexample,
  ...Object.fromEntries(Object.entries(importersamples).map(([name, text]) => [`importers/${name}`, text])),
  "recipes/gallery.json": gallerytext,
  ...Object.fromEntries(Object.entries(recipeplans).map(([id, text]) => [`recipes/${id}.json`, text])),
  ...Object.fromEntries(Object.entries(fixturepages).map(([name, text]) => [`pages/${name}`, text])),
};
const fixtureset = [
  { source: "example-org-pagestate.json", target: "fixtures/example-org-pagestate.json" },
  { source: "mcp.client.ts", target: "fixtures/mcp.client.ts" },
  { source: "cjs.js", target: "fixtures/cjs.js" },
  { source: "bun.ts", target: "fixtures/bun.ts" },
  { source: "deno.ts", target: "fixtures/deno.ts" },
  { source: "form-inventory-plan.json", target: "fixtures/plans/form-inventory-plan.json" },
  { source: "release-notes-plan.json", target: "fixtures/plans/release-notes-plan.json" },
  { source: "changelog-digest-workflow.json", target: "fixtures/workflows/changelog-digest-workflow.json" },
  { source: "form-survey-workflow.json", target: "fixtures/workflows/form-survey-workflow.json" },
  { source: "importers/v1-plan.json", target: "fixtures/importers/v1-plan.json" },
  { source: "importers/automa-workflow.json", target: "fixtures/importers/automa-workflow.json" },
  { source: "importers/selenium-side.json", target: "fixtures/importers/selenium-side.json" },
  { source: "importers/uivision-macro.json", target: "fixtures/importers/uivision-macro.json" },
  { source: "importers/tabular-plan.csv", target: "fixtures/importers/tabular-plan.csv" },
  { source: "recipes/gallery.json", target: "gallery.json" },
  { source: "recipes/scrapeproductgrid.json", target: "fixtures/recipes/scrapeproductgrid.json" },
  { source: "recipes/scrapetablepagination.json", target: "fixtures/recipes/scrapetablepagination.json" },
  { source: "recipes/scrapereviews.json", target: "fixtures/recipes/scrapereviews.json" },
  { source: "recipes/scrapesearchresults.json", target: "fixtures/recipes/scrapesearchresults.json" },
  { source: "recipes/scrapenestedlists.json", target: "fixtures/recipes/scrapenestedlists.json" },
  { source: "recipes/scrapeinfinitefeed.json", target: "fixtures/recipes/scrapeinfinitefeed.json" },
  { source: "recipes/scrapedynamicprices.json", target: "fixtures/recipes/scrapedynamicprices.json" },
  { source: "recipes/scrapeimagegallery.json", target: "fixtures/recipes/scrapeimagegallery.json" },
  { source: "recipes/fillloginform.json", target: "fixtures/recipes/fillloginform.json" },
  { source: "recipes/fillcheckout.json", target: "fixtures/recipes/fillcheckout.json" },
  { source: "recipes/fillregistration.json", target: "fixtures/recipes/fillregistration.json" },
  { source: "recipes/fillsearchfilters.json", target: "fixtures/recipes/fillsearchfilters.json" },
  { source: "recipes/fillmultistepwizard.json", target: "fixtures/recipes/fillmultistepwizard.json" },
  { source: "recipes/filldependentdropdowns.json", target: "fixtures/recipes/filldependentdropdowns.json" },
  { source: "recipes/filltypeahead.json", target: "fixtures/recipes/filltypeahead.json" },
  { source: "recipes/fillcalendar.json", target: "fixtures/recipes/fillcalendar.json" },
  { source: "recipes/fillfromcsv.json", target: "fixtures/recipes/fillfromcsv.json" },
  { source: "recipes/testlinkcheck.json", target: "fixtures/recipes/testlinkcheck.json" },
  { source: "recipes/testconsoleerrors.json", target: "fixtures/recipes/testconsoleerrors.json" },
  { source: "recipes/testformvalidation.json", target: "fixtures/recipes/testformvalidation.json" },
  { source: "recipes/testlayoutshift.json", target: "fixtures/recipes/testlayoutshift.json" },
  { source: "recipes/testvisualdiff.json", target: "fixtures/recipes/testvisualdiff.json" },
  { source: "recipes/testloadtiming.json", target: "fixtures/recipes/testloadtiming.json" },
  { source: "recipes/testaccessibility.json", target: "fixtures/recipes/testaccessibility.json" },
  { source: "recipes/testdeeplinks.json", target: "fixtures/recipes/testdeeplinks.json" },
  { source: "recipes/monitorpricechange.json", target: "fixtures/recipes/monitorpricechange.json" },
  { source: "recipes/monitoravailability.json", target: "fixtures/recipes/monitoravailability.json" },
  { source: "recipes/monitornetworkquiet.json", target: "fixtures/recipes/monitornetworkquiet.json" },
  { source: "recipes/monitorpagechanges.json", target: "fixtures/recipes/monitorpagechanges.json" },
  { source: "recipes/monitorschedule.json", target: "fixtures/recipes/monitorschedule.json" },
  { source: "recipes/monitoralerts.json", target: "fixtures/recipes/monitoralerts.json" },
  { source: "recipes/agentswarm.json", target: "fixtures/recipes/agentswarm.json" },
  { source: "recipes/agentsreview.json", target: "fixtures/recipes/agentsreview.json" },
  { source: "recipes/agentsforms.json", target: "fixtures/recipes/agentsforms.json" },
  { source: "recipes/agentsmonitor.json", target: "fixtures/recipes/agentsmonitor.json" },
  { source: "recipes/agentscompete.json", target: "fixtures/recipes/agentscompete.json" },
  { source: "pages/product-grid.html", target: "fixtures/pages/product-grid.html" },
  { source: "pages/checkout.html", target: "fixtures/pages/checkout.html" },
  { source: "pages/dashboard.html", target: "fixtures/pages/dashboard.html" },
  { source: "pages/feed.html", target: "fixtures/pages/feed.html" },
];
await mkdir(join(root, "build", "fixtures", "plans"), { recursive: true });
await mkdir(join(root, "build", "fixtures", "workflows"), { recursive: true });
await mkdir(join(root, "build", "fixtures", "importers"), { recursive: true });
await mkdir(join(root, "build", "fixtures", "recipes"), { recursive: true });
await mkdir(join(root, "build", "fixtures", "pages"), { recursive: true });
for (const fixture of fixtureset) {
  const text = modulefixtures[fixture.source];
  if (text === undefined)
    throw new Error(
      `The fixture ${fixture.source} answers no module of the flat typed folder; every fixture text lives in a typescript fixture module, so the missing row fails the build instead of reading a retired test/code path.`,
    );
  await writeFile(record(fixture.target), text, "utf8");
}
const umdexampletext = umdexample;
const umdexamplestamped = `<!-- devthink ${packagejson.version} umd example page — GPL-3.0-only -->\n${umdexampletext.replace("../../distpackage/devthink.umd.js", "./devthink.umd.js")}`;
if (!umdexamplestamped.endsWith(umdexampletext.replace("../../distpackage/devthink.umd.js", "./devthink.umd.js")))
  throw new Error(
    "The umd example source carries the distpackage bundle reference the build rewrites; the reference stayed unchanged.",
  );
await writeFile(record("umd-example.html"), umdexamplestamped, "utf8");
console.log(
  `Contract artifacts built: build/caps of ${capsurfaces.length} surfaces, build/schemas of ${schemefiles.length} frozen schemas, the build/fixtures example set with the 2.0.0 example gallery (36 recipes, 4 fixture pages and the gallery index) and the build/umd-example.html page.`,
);

/** The minified companion pair: the minifier reads the stamped recipe output and writes the minified variant with its own sourcemap beside it, so the checksum and the parity expectations of the distpackage contract cover the companion script like every other bundle. */
await build({
  entryPoints: [join("build", "companion.js")],
  outfile: record("companion.min.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
  minify: true,
  banner: { js: banner },
});

/** The bundle size accounting of every distpackage target: every target reports its byte size against its budget and an overgrown bundle fails the build. */
const bundleaccounting = [];
for (const [target, file] of [
  ["index", "index.js"],
  ["indexcjs", "index.cjs"],
  ["neutral", "index.neutral.js"],
  ["cli", "cli.js"],
  ["headless", "headless.js"],
  ["mcp", "mcp.js"],
  ["bridge", "bridge.js"],
  ["companion", "companion.js"],
  ["policy", "policy.js"],
  ["protocol", "protocol.js"],
  ["memory", "memory.js"],
  ["progress", "progress.js"],
  ["hardening", "hardening.js"],
  ["dashboard", "dashboard.js"],
  ["server", "server.js"],
  ["crossbrowser", "crossbrowser.js"],
  ["pack", "pack.js"],
  ["http", "http.js"],
  ["queue", "queue.js"],
]) {
  const bytes = (await stat(join(root, "build", file))).size;
  bundleaccounting.push({ target, bytes, budget: bundlebudgets[target] });
  if (bytes > bundlebudgets[target])
    throw new Error(`The ${target} bundle of ${bytes} bytes exceeds its ${bundlebudgets[target]} byte budget.`);
}

/** The naming check keeps every unminified bundle free of underscored identifiers: the reviewed vocabulary declares no underscored name, so a bundle that grows one carries an unreviewed dependency; the scanner strips the string, comment and regex literals first and the ecmascript platform constants stay allowlisted because their names belong to the platform, not to the review. The minified variants stay outside the naming check because the minifier mangles nested scopes into underscored names and unquotes underscored object keys — the parity and checksum checks carry those variants instead. */
for (const bundle of emitted.filter((name) => !name.includes(".min."))) {
  const content = stripstrings(await readFile(join(root, "build", bundle), "utf8"));
  const underscored = underscorednames(content);
  if (underscored.length > 0)
    throw new Error(
      `The bundle ${bundle} carries the underscored identifier${underscored.length === 1 ? "" : "s"} ${[...new Set(underscored)].slice(0, 5).join(", ")}; the reviewed vocabulary carries none.`,
    );
}

/** The platform matrix drives the runtime shells: every declared target builds through its own adapter entry in one matrix run, each with its minified variant beside it. */
await build({
  entryPoints: ["runtime.ts"],
  outfile: "build/runtime.js",
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
});
const { platformtargets, targetoutput, minifiedoutput } = await importbundle(join(root, "build/runtime.js"));
const targets = platformtargets();
for (const target of targets) {
  const output = join("build", targetoutput(target));
  const minified = join("build", minifiedoutput(target));
  if (target.format === "umd") {
    await build({
      entryPoints: [target.entry],
      outfile: join(root, "build", "umd-cjs-core.cjs"),
      bundle: true,
      format: "cjs",
      platform: target.platform,
      target: "chrome120",
      sourcemap: false,
    });
    const body = await readFile(join(root, "build", "umd-cjs-core.cjs"), "utf8");
    await writeFile(record(targetoutput(target)), `${banner}\n${umdwrap(body, "devthink")}`, "utf8");
    await writeFile(
      `${output}.map`,
      JSON.stringify({ version: 3, file: targetoutput(target), sources: [target.entry], sourcesContent: [body] }),
      "utf8",
    );
    await rm(join(root, "build", "umd-cjs-core.cjs"), { force: true });
    await build({
      entryPoints: [target.entry],
      outfile: join(root, "build", "umd-cjs-core.cjs"),
      bundle: true,
      format: "cjs",
      platform: target.platform,
      target: "chrome120",
      sourcemap: false,
      minify: true,
    });
    const minbody = await readFile(join(root, "build", "umd-cjs-core.cjs"), "utf8");
    await writeFile(record(minifiedoutput(target)), `${banner}\n${umdwrap(minbody, "devthink")}`, "utf8");
    await writeFile(
      `${minified}.map`,
      JSON.stringify({ version: 3, file: minifiedoutput(target), sources: [target.entry], sourcesContent: [minbody] }),
      "utf8",
    );
    await rm(join(root, "build", "umd-cjs-core.cjs"), { force: true });
  } else {
    await build({
      entryPoints: [target.entry],
      outfile: record(targetoutput(target)),
      bundle: true,
      format: target.format,
      platform: target.platform,
      target: target.platform === "browser" ? "chrome120" : target.platform === "node" ? "node22" : "es2022",
      sourcemap: true,
      banner: { js: banner },
    });
    await build({
      entryPoints: [target.entry],
      outfile: record(minifiedoutput(target)),
      bundle: true,
      format: target.format,
      platform: target.platform,
      target: target.platform === "browser" ? "chrome120" : target.platform === "node" ? "node22" : "es2022",
      sourcemap: true,
      minify: true,
      banner: { js: banner },
    });
  }
}
await rm(join(root, "build", "runtime.js"), { force: true });
await rm(join(root, "build", "runtime.js.map"), { force: true });

/** The matrix bundles join the size accounting with their own budgets: the node shell rides the cjs budget and the bun and deno shells ride the esm budgets of their sizes. */
for (const target of targets) {
  const name = target.format === "umd" ? "umd" : target.runtime;
  const bytes = (await stat(join(root, "build", targetoutput(target)))).size;
  bundleaccounting.push({ target: name, bytes, budget: bundlebudgets[name] });
  if (bytes > bundlebudgets[name])
    throw new Error(`The ${name} bundle of ${bytes} bytes exceeds its ${bundlebudgets[name]} byte budget.`);
}

/** The matrix bundles join the naming check after their emission, so every runtime shell carries the reviewed vocabulary the core carries. */
for (const target of targets) {
  const content = stripstrings(await readFile(join(root, "build", targetoutput(target)), "utf8"));
  const underscored = underscorednames(content);
  if (underscored.length > 0)
    throw new Error(
      `The bundle ${targetoutput(target)} carries the underscored identifier${underscored.length === 1 ? "" : "s"} ${[...new Set(underscored)].slice(0, 5).join(", ")}; the reviewed vocabulary carries none.`,
    );
}

/* The surface entries of the grand-merge layout: background and offscreen stay
   root modules (the engine imports them), the pure interface surfaces ride the
   application root beside them (the sol merge moved the theme root files up).
   The lazy storage.ts preference lane of the dashboard keyword file (the wave
   consolidation folded desktopstate.ts into it) stays external here too: the
   extension surface never resolves the account store seam, and the lane it
   would answer degrades to the honest floating default the pure layer keeps. */
const surfaceentry = (name: string) => (name === "background" || name === "offscreen" ? `${name}.ts` : `${name}.ts`);
await Promise.all(
  ["background", "popup", "sidepanel", "offscreen", "transparencypage", "dashboardpage", "optionspage"].map((name) =>
    build({
      entryPoints: [surfaceentry(name)],
      outfile: `build/extension/${name}.js`,
      bundle: true,
      format: "esm",
      platform: "browser",
      target: "chrome120",
      sourcemap: true,
      external: ["./storage.ts"],
    }),
  ),
);
await build({
  entryPoints: ["pagebridge.ts"],
  outfile: "build/extension/pagebridge.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "chrome120",
  sourcemap: true,
});
/** The source manifest of the 1.1.93 single manifest design: the firefox, safari and vsix overlays ride the root manifest.json under the browsers and vsix keys, one manifest speaks every webextension dialect and no second hand maintained manifest file exists; the version the root manifest carries stays the single version source every overlay inherits. */
const sourcemanifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
/** The extension copy of the root manifest: the shipped chromium manifest drops the browsers and vsix metadata keys because the derived browser manifests the artifacts carry never include the overlay metadata of the other targets. */
const extensionmanifest = { ...sourcemanifest };
delete extensionmanifest.browsers;
delete extensionmanifest.vsix;
await writeFile(join(extensiondist, "manifest.json"), `${JSON.stringify(extensionmanifest, null, 2)}\n`, "utf8");
/** The web surface step of the 1.1.88 consolidation: the one design file design.html carries every surface template and the shared stylesheet embedded, and the build splits the templates into the per-surface extension pages with the stylesheet written beside them, so the extension surfaces and the deployed site render from one design. */
const webdir = root;
const webindex = await readFile(join(webdir, "design.html"), "utf8");
const extensionstyle = /<style data-source="extension">([\s\S]*?)<\/style>/.exec(webindex)?.[1]?.trim() ?? "";
const surfacematches = [...webindex.matchAll(/<template data-surface="([^"]+)">([\s\S]*?)<\/template>/g)].map(
  (match) => ({ name: match[1], body: match[2].trim() }),
);
const surfacetitles: Record<string, string | undefined> = {
  popup: "DevThink",
  sidepanel: "DevThink review",
  dashboardpage: "DevThink dashboard",
  optionspage: "DevThink options",
  transparencypage: "DevThink transparency",
  sandbox: "DevThink sandbox frame",
  offscreen: "DevThink offscreen",
};
const styledsurfaces = new Set(["popup", "sidepanel", "dashboardpage", "optionspage", "transparencypage"]);
if (extensionstyle === "")
  throw new Error("The web design file carries the embedded extension stylesheet; the build found none.");
await writeFile(join(extensiondist, "style.css"), `${extensionstyle}\n`, "utf8");
for (const surface of surfacematches) {
  if (surface.name === "site") continue; /* the site surface deploys from the application root as the static site */
  const title = surfacetitles[surface.name];
  if (title === undefined)
    throw new Error(`The web design file carries the surface ${surface.name} without a known extension page title.`);
  const stylelink = styledsurfaces.has(surface.name) ? '<link rel="stylesheet" href="style.css">' : "";
  await writeFile(
    join(extensiondist, `${surface.name}.html`),
    `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>${stylelink}</head>\n<body>\n${surface.body}\n</body>\n</html>\n`,
    "utf8",
  );
}
for (const required of [
  "popup",
  "sidepanel",
  "sandbox",
  "offscreen",
  "dashboardpage",
  "optionspage",
  "transparencypage",
]) {
  if (!surfacematches.some((surface) => surface.name === required))
    throw new Error(`The web design file misses the ${required} surface template the manifest declares.`);
}

/** The icon family of the 2.0.2 final polish: the root icons.ts module carries the store-ready icon set as base64 png payloads — the repository stays text-only — and the build materializes them into the extension zip directory the manifest icons block, the action default icon and the notification icon path resolve against. Every payload is verified at build time: it decodes to a real png header, its ihdr width and height match the size key it rides under, and the manifest icon paths agree with the materialized files, so the icon set provably renders at the required sizes before any artifact ships. */
const iconssource = await readFile(join(root, "icons.ts"), "utf8");
const iconblock = /export const iconpayloads: Record<string, string> = \{([\s\S]*?)\};/.exec(iconssource)?.[1] ?? "";
const iconentries = [...iconblock.matchAll(/"(\d+)":\s*"([A-Za-z0-9+/=]+)"/g)].map((match) => ({
  size: Number(match[1]),
  base64: match[2],
}));
if (iconentries.length !== 6)
  throw new Error(
    `The icon family of the final polish carries six required sizes; the icons module declares ${iconentries.length}.`,
  );
const iconsizes = new Set(iconentries.map((entry) => entry.size));
for (const size of [16, 19, 32, 38, 48, 128])
  if (!iconsizes.has(size)) throw new Error(`The icon family misses the required ${size} pixel size.`);
await mkdir(join(extensiondist, "icons"), { recursive: true });
for (const entry of iconentries) {
  const bytes = Buffer.from(entry.base64, "base64");
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.subarray(0, 8).equals(signature) === false)
    throw new Error(`The ${entry.size} pixel icon payload does not decode to a png header.`);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== entry.size || height !== entry.size)
    throw new Error(
      `The ${entry.size} pixel icon payload decodes to ${width}x${height}; every icon renders at its declared size.`,
    );
  if (extensionmanifest.icons?.[String(entry.size)] !== `icons/${entry.size}.png`)
    throw new Error(`The manifest icons block does not resolve the ${entry.size} pixel icon the build materializes.`);
  await writeFile(join(extensiondist, "icons", `${entry.size}.png`), bytes);
}
for (const size of Object.keys(extensionmanifest.icons ?? {}))
  if (!iconsizes.has(Number(size)))
    throw new Error(`The manifest icons block references the ${size} pixel size the icons module does not carry.`);
if (extensionmanifest.action?.default_icon?.["128"] !== "icons/128.png")
  throw new Error("The action default icon block does not resolve the 128 pixel toolbar icon the build materializes.");

/** The extension bundle and the browser library bundles stay free of node shims: the runtime entries reach the platform through the adapter seam only, so neither the extension targets nor the neutral and umd library modes ever leak a node import into a browser bundle. */
const nodeshim = /(?:from\s*|require\(\s*)["']node:/;
for (const name of [
  "background",
  "popup",
  "sidepanel",
  "offscreen",
  "pagebridge",
  "transparencypage",
  "dashboardpage",
  "optionspage",
]) {
  const content = await readFile(join(extensiondist, `${name}.js`), "utf8");
  if (nodeshim.test(content))
    throw new Error(
      `The extension bundle ${name}.js carries a node shim; the browser targets stay free of node imports.`,
    );
}
for (const name of ["index.neutral.js", "index.neutral.min.js", "devthink.umd.js", "devthink.umd.min.js"]) {
  const content = await readFile(join(root, "build", name), "utf8");
  if (nodeshim.test(content))
    throw new Error(
      `The browser library bundle ${name} carries a node shim; the browser condition stays free of node imports.`,
    );
}

/** The declaration emit covers every public module: the matrix targets keep their declaration files and the policy, protocol, memory, progress and hardening module entries carry the declaration files the exports map types conditions read. */
for (const target of targets) {
  const declaration = await readFile(join(root, "build", `${target.entry.replace(/\.ts$/, "")}.d.ts`), "utf8");
  if (declaration.trim() === "") throw new Error(`The ${target.runtime} platform target lacks its declaration file.`);
}
for (const entry of [
  "index",
  "cjs",
  "neutral",
  "policy",
  "protocol",
  "memory",
  "progress",
  "hardening",
  "dashboard",
  "queue",
  "types",
  "runtime",
  "umd",
  "node",
  "bun",
  "deno",
  "headless",
  "cli",
  "agent",
  "auth",
  "http",
  "server",
  "page",
  "mcp",
  "serve",
  "tools",
  "bridge",
  "crossbrowser",
  "pack",
  "companion",
  "version",
]) {
  const declaration = await readFile(join(root, "build", `${entry}.d.ts`), "utf8");
  if (declaration.trim() === "") throw new Error(`The ${entry} module entry lacks its declaration file.`);
}

/** The staticdeploy step of the 1.1.82 site integration family: the plain static assets of site/ build to build/site with content hashed file names (the index rewrites its asset references to the hashed names), an immutable cache header configuration rides beside them as a plain static _headers file with zero server functions, no edge functions, no redirect rules and no vendor runtime, and the site zip ships as its own release artifact instead of entering the package exports map. */
const siteaccounting = [];
const sitehashof = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex").slice(0, 10);
const sitedir = root;
const sitedist = join(root, "build", "site");
await mkdir(sitedist, { recursive: true });
let siteindex = await readFile(join(sitedir, "design.html"), "utf8");
const headerlines = ["/index.html", "  Cache-Control: no-cache"];
siteaccounting.push({ file: "index.html", bytes: siteindex.length, budget: 300_000 });
if (siteindex.length > 300_000)
  throw new Error(`The one design file of ${siteindex.length} bytes exceeds its 300000 byte budget.`);
for (const asset of ["sitemanifest.json"]) {
  const bytes = await readFile(join(sitedir, asset));
  const hashed = asset.replace(/(\.[^.]+)$/, `.${sitehashof(bytes)}$1`);
  await writeFile(join(sitedist, hashed), bytes);
  emitted.push(`site/${hashed}`);
  siteindex = siteindex.split(asset).join(hashed);
  headerlines.push(`/${hashed}`, "  Cache-Control: public, max-age=31536000, immutable");
  const bytesize = bytes.length;
  siteaccounting.push({ file: hashed, bytes: bytesize, budget: 100_000 });
  if (bytesize > 100_000)
    throw new Error(`The site asset ${asset} of ${bytesize} bytes exceeds its 100000 byte budget.`);
}
await writeFile(join(sitedist, "index.html"), siteindex, "utf8");
emitted.push("site/index.html");
await writeFile(join(sitedist, "_headers"), `${headerlines.join("\n")}\n`, "utf8");
emitted.push("site/_headers");
const sitebytes = siteaccounting.reduce((total, entry) => total + entry.bytes, 0);
if (sitebytes > 400_000) throw new Error(`The static site of ${sitebytes} bytes exceeds its 400000 byte total budget.`);
const sitefiletypes = [
  ...new Set(
    (await readdir(sitedist)).map((file) => (file.startsWith("_") ? file : file.slice(file.lastIndexOf(".") + 1))),
  ),
];
if (!sitefiletypes.every((type) => ["html", "css", "js", "json", "_headers"].includes(type)))
  throw new Error(`The static site output carries a non static file type: ${sitefiletypes.join(", ")}.`);
for (const file of await readdir(sitedist)) {
  const underscored = underscorednames(stripstrings(await readFile(join(sitedist, file), "utf8")));
  if (underscored.length > 0)
    throw new Error(
      `The site file ${file} carries the underscored identifier${underscored.length === 1 ? "" : "s"} ${[...new Set(underscored)].slice(0, 5).join(", ")}; the reviewed site vocabulary carries none.`,
    );
}

/** The extension gallery copy of the 2.0.0 example gallery: the chromium extension archive carries the gallery index and its recipe plans under fixtures/ so the sidepanel one click import reads them through the runtime url of the packaged extension — the plans stay pure plan documents, the fixture pages stay package fixtures the recipes name, and no recipe grows a remote origin; the texts come from the recipesfixtures module the distpackage fixture set ships. */
const extensionfixtures = join(extensiondist, "fixtures", "recipes");
await mkdir(extensionfixtures, { recursive: true });
await writeFile(join(extensiondist, "fixtures", "gallery.json"), gallerytext, "utf8");
for (const [id, text] of Object.entries(recipeplans))
  await writeFile(join(extensionfixtures, `${id}.json`), text, "utf8");

/** The chromium extension zip of the release: the build packs the extension distpackage directory into the version stamped archive the release workflow attaches beside every other artifact. */
await rm(join(root, "build", `devthink${packagejson.version}.zip`), { force: true });
await execute("zip", ["-qr", `../devthink${packagejson.version}.zip`, "."], { cwd: extensiondist });

/** The firefox target of the 1.1.86 browser coverage family: the build reads the source manifest, layers the firefox overlay (the browsers.firefox section of the root manifest.json) on top through the firefoxprep adapter, assembles the xpi through the xpipack assembler with the adapted manifest and the hashed extension distpackage bundles, and writes the artifact beside the chromium extension zip; the artifact name carries the release version, the manifest placement sits at the archive root, and the addons linter markers stay inside the budget the build asserts. */
const firefoxoverlay = sourcemanifest.browsers?.firefox;
if (firefoxoverlay === undefined)
  throw new Error(
    "The root manifest carries the firefox overlay under the browsers key; a missing overlay never builds the firefox target.",
  );
const firefoxprep = await importbundle(join(root, "build", "crossbrowser.js"));
const xpipack = await importbundle(join(root, "build", "crossbrowser.js"));
const firefoxadapted = firefoxprep.firefoxprepadapt({
  manifest: sourcemanifest,
  overlay: firefoxoverlay,
  backgroundscripts: ["background.js"],
});
const firefoxbundleentries = [];
const firefoxhashof = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex").slice(0, 10);
for (const name of [
  "background.js",
  "popup.js",
  "sidepanel.js",
  "pagebridge.js",
  "offscreen.js",
  "transparencypage.js",
  "dashboardpage.js",
  "optionspage.js",
]) {
  try {
    const bytes = await readFile(join(extensiondist, name));
    const hashed = name.replace(/(\.[^.]+)$/, `.${firefoxhashof(bytes)}$1`);
    await writeFile(join(extensiondist, hashed), bytes);
    firefoxbundleentries.push({ name: hashed, bytes: new Uint8Array(bytes) });
  } catch {
    /* the page bridge bundle is optional on the firefox target */
  }
}
for (const asset of [
  "popup.html",
  "offscreen.html",
  "sandbox.html",
  "sidepanel.html",
  "transparencypage.html",
  "dashboardpage.html",
  "optionspage.html",
  "style.css",
  "icons/16.png",
  "icons/19.png",
  "icons/32.png",
  "icons/38.png",
  "icons/48.png",
  "icons/128.png",
]) {
  try {
    const bytes = await readFile(join(extensiondist, asset));
    firefoxbundleentries.push({ name: asset, bytes: new Uint8Array(bytes) });
  } catch {
    /* the firefox target carries the assets the chromium build ships */
  }
}
const xpibuilt = xpipack.xpipackassemble({
  manifest: firefoxadapted.manifest,
  bundleentries: firefoxbundleentries,
  version: packagejson.version,
});
await writeFile(join(root, "build", `devthink-firefox-${packagejson.version}.xpi`), Buffer.from(xpibuilt.archive.bytes));
const lintercheck = xpipack.xpipacklintercheck({ markers: xpibuilt.lintermarkers, budget: xpipack.xpilinterbudget });
if (!lintercheck.ok) throw new Error(lintercheck.reason ?? "The firefox xpi failed the addons linter budget.");

/** The safari target of the 1.1.86 browser coverage family: the build embeds the chromium extension payload (the manifest, the background bundle, the page bundles and the assets) into the safari app extension wrapper through the safariskeleton module, and the wrapper ships beside the chromium zip and the firefox xpi with the bundle id, the entitlements and the minimal app shell the wrapper declares. */
const safariskeleton = await importbundle(join(root, "build", "crossbrowser.js"));
const safaripayload = [];
safaripayload.push({
  name: "manifest.json",
  bytes: new Uint8Array(await readFile(join(extensiondist, "manifest.json"))),
});
for (const name of [
  "background.js",
  "popup.js",
  "sidepanel.js",
  "pagebridge.js",
  "offscreen.js",
  "transparencypage.js",
  "dashboardpage.js",
  "optionspage.js",
]) {
  try {
    safaripayload.push({ name, bytes: new Uint8Array(await readFile(join(extensiondist, name))) });
  } catch {
    /* optional */
  }
}
for (const asset of [
  "popup.html",
  "offscreen.html",
  "sandbox.html",
  "sidepanel.html",
  "transparencypage.html",
  "dashboardpage.html",
  "optionspage.html",
  "style.css",
  "icons/16.png",
  "icons/19.png",
  "icons/32.png",
  "icons/38.png",
  "icons/48.png",
  "icons/128.png",
]) {
  try {
    safaripayload.push({ name: asset, bytes: new Uint8Array(await readFile(join(extensiondist, asset))) });
  } catch {
    /* optional */
  }
}
const safaribuilt = safariskeleton.safariskeletonbuild({
  version: packagejson.version,
  bundleid: "com.wenathlan.devthink",
  extensionpayload: safaripayload,
  entitlements: ["com.apple.security.app-sandbox", "com.apple.security.network.client"],
});
await writeFile(
  join(root, "build", `devthink-safari-${packagejson.version}.zip`),
  Buffer.from(safaribuilt.archive.bytes),
);

/** The vs code target of the 1.1.87 publishing pipeline family: the build reads the vsix manifest overlay (the vsix section of the root manifest.json), reuses the library esm build the webview imports, assembles the vsix through the vsixpack assembler with the extension manifest, the webview page and the esm bundle, runs the marketplace metadata check over the package fields and writes the artifact beside the browser builds; the package declares no telemetry and no network default, and no vendor marketplace url appears anywhere in the archive. */
const vsixpack = await importbundle(join(root, "build", "pack.js"));
const vsixmanifestsource = sourcemanifest.vsix;
if (vsixmanifestsource === undefined)
  throw new Error(
    "The root manifest carries the vsix overlay under the vsix key; a missing overlay never builds the vs code target.",
  );
const vsixbuilt = vsixpack.vsixpackassemble({
  version: packagejson.version,
  esmbundlebytes: new Uint8Array(await readFile(join(root, "build", "index.js"))),
  ...(typeof vsixmanifestsource.relaypath === "string" ? { relaypath: vsixmanifestsource.relaypath } : {}),
});
await writeFile(join(root, "build", vsixbuilt.archive.name), Buffer.from(vsixbuilt.archive.bytes));
const vsixmetadata = vsixpack.vsixmarketplacemetadatacheck({
  fields: vsixbuilt.manifestfields,
  manifesttext: vsixpack.vsixpackmanifest(vsixbuilt.manifestfields),
});
if (!vsixmetadata.ok) throw new Error(vsixmetadata.reason ?? "The vsix failed the marketplace metadata check.");
if (vsixbuilt.manifestfields.version !== sourcemanifest.version)
  throw new Error(
    "The vsix manifest carries the version the root manifest owns; the single version source never drifts between the package stamp and the root manifest.",
  );

/** The declarations zip of the 1.1.87 publishing pipeline family: the build packs every declaration file and declaration map into the version stamped archive the release attaches beside the bundles and the maven pom attaches with the declarations classifier. */
const declarationsname = `devthink-declarations-${packagejson.version}.zip`;
const declarationfiles = (await readdir(join(root, "build")))
  .filter((file) => file.endsWith(".d.ts") || file.endsWith(".d.ts.map"))
  .sort();
if (declarationfiles.length === 0)
  throw new Error(
    "The declarations zip packs the declaration files for ide integration; an empty declaration set never ships.",
  );
await rm(join(root, "build", declarationsname), { force: true });
await execute("zip", ["-qr", declarationsname, ...declarationfiles], { cwd: join(root, "build") });
emitted.push(declarationsname);

/** The site zip of the 1.1.87 publishing pipeline family: the build packs the hashed static site (the chatbridge assets and the immutable cache header configuration) into the version stamped archive the release attaches beside the extension artifacts for the site channel. */
const sitename = `devthink-site-${packagejson.version}.zip`;
await rm(join(root, "build", sitename), { force: true });
await execute("zip", ["-qr", `../${sitename}`, "."], { cwd: sitedist });

/** The artifact manifest of the 1.1.87 publishing pipeline family: the build records every artifact it produced — every distpackage bundle, the declarations zip and the extension artifacts — with its name, size, sha256 checksum and publishing channels; the manifest carries no timestamp so the same artifact set renders byte identical on every run, and the verify workflow asserts the built set matches it exactly. */
const artifactmanifestmodule = await importbundle(join(root, "build", "pack.js"));
const releaseartifacts = [];
for (const bundle of [...emitted]) {
  if (bundle.startsWith("site/"))
    continue; /* the static site assets carry their own manifest, not the artifact manifest of the publishing pipeline */
  const bytes = await readFile(join(root, "build", bundle));
  releaseartifacts.push({
    name: `build/${bundle}`,
    size: bytes.length,
    checksum: createHash("sha256").update(bytes).digest("hex"),
  });
}
for (const artifact of [
  `devthink${packagejson.version}.zip`,
  `devthink-firefox-${packagejson.version}.xpi`,
  `devthink-safari-${packagejson.version}.zip`,
  vsixbuilt.archive.name,
  sitename,
]) {
  const bytes = await readFile(join(root, "build", artifact));
  releaseartifacts.push({
    name: `build/${artifact}`,
    size: bytes.length,
    checksum: createHash("sha256").update(bytes).digest("hex"),
  });
}
const localmanifest = artifactmanifestmodule.artifactmanifestof({
  version: packagejson.version,
  artifacts: releaseartifacts,
});
await writeFile(
  join(root, "build", "artifactmanifest.json"),
  artifactmanifestmodule.artifactmanifesttext(localmanifest),
  "utf8",
);
emitted.push("artifactmanifest.json");

/** The checksums file of every distpackage target: one sha256 line per emitted bundle and one line for the published manifest identity key, so a consumer verifies every mode file against the build that shipped it while the identity pin rides the generated artifact instead of a hard coded constant; the file is written after every artifact exists so the declarations zip and the artifact manifest join the covered set. */
const checksums = [];
for (const bundle of emitted.sort()) {
  const digest = createHash("sha256")
    .update(await readFile(join(root, "build", bundle)))
    .digest("hex");
  checksums.push(`${digest}  ${bundle}`);
}
const identitymanifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
const identitykey = Buffer.from(String(identitymanifest.key), "base64");
checksums.push(`${createHash("sha256").update(identitykey).digest("hex")}  manifest.json key`);
await writeFile(join(root, "build", "checksums.txt"), `${checksums.join("\n")}\n`, "utf8");

/** The apimap build check of the 1.1.86 browser coverage family: the build asserts every recorded api has a chromium and firefox mapping (a missing row fails the build before the cross browser artifacts ship), so a new api without a row never reaches the firefox or the safari build. */
const apimapmodule = await importbundle(join(root, "build", "crossbrowser.js"));
const apireport = apimapmodule.apimapunmapped(apimapmodule.apimapentries());
if (apireport.failed) throw new Error(apireport.reason);
console.log(
  `Devthink targets built: ${targets.map((target: platformtarget) => `${target.runtime}=${targetoutput(target)}`).join(", ")} beside the esm and cjs core, the neutral browser bundle, the per module entries, the cli and the headless library entry.`,
);
console.log(
  `Bundle size accounting: ${bundleaccounting.map((entry) => `${entry.target}=${entry.bytes}/${entry.budget}b`).join(", ")}.`,
);
console.log(`Checksums written for ${emitted.length} build bundles into build/checksums.txt.`);
console.log(
  `Publishing pipeline artifacts: build/${vsixbuilt.archive.name} (${vsixbuilt.entries.length} entries, ${vsixbuilt.archive.bytes.length} bytes), build/${declarationsname} (${releaseartifacts.filter((entry) => entry.name === `build/${declarationsname}`).length > 0 ? "declared" : "staged"}), build/${sitename} and build/artifactmanifest.json (${localmanifest.artifacts.length} artifacts with names, sizes, checksums and channels).`,
);
console.log(
  `Static site built to build/site with hashed file names: ${siteaccounting.map((entry) => `${entry.file}=${entry.bytes}b`).join(", ")} of ${sitebytes} total bytes and the immutable cache header configuration in build/site/_headers.`,
);
console.log(
  `Cross browser artifacts: build/devthink-firefox-${packagejson.version}.xpi (${xpibuilt.entries.length} entries, ${xpibuilt.archive.bytes.length} bytes) and build/devthink-safari-${packagejson.version}.zip (${safaribuilt.projectfiles.length} project files + ${safaripayload.length} payload entries, ${safaribuilt.archive.bytes.length} bytes).`,
);
console.log(
  `Apimap build check: ${apireport.rows.length} rows, ${apireport.missingchromium.length} chromium missing, ${apireport.missingfirefox.length} firefox missing, ${apireport.missingsafari.length} safari missing.`,
);

/** The flat npm package staging of the 2.0.3 organization pass: the library surface the exports map resolves ships at the package root — one file per correlated domain, no nested folder, no path nested past two directories — with the data groups (caps, schemas, fixtures) beside it, the umd example page, the extension manifest the cli manifest command reads, and the package scoped checksums covering exactly the shipped set. The source maps stay behind (the build tree and the release assets keep them — the published package rides lean with the js and the declarations), and the generated package.json mirrors the repository manifest with the entry paths remapped to the root, so the published tarball opens flat and organized the same way the repository sources stay; the release workflow packs the staged tree (`npm pack ./distpackage`) on the github build machines and the repository keeps no build output of its own. */
const stage = join(root, "distpackage");
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
const stagerootfiles = [
  "index.js",
  "index.cjs",
  "index.neutral.js",
  "devthink.umd.js",
  "policy.js",
  "protocol.js",
  "memory.js",
  "progress.js",
  "hardening.js",
  "dashboard.js",
  /* the os seam entries of the ownership wave (wave/ownership.getry): the
     moved gateway graph imports them through the published specifiers, so
     the flat package answers every seam the getry owner leans on. */
  "config.js",
  "constants.js",
  "core.js",
  "data.js",
  "os.js",
  "graph.js",
  "hono.js",
  "commands.js",
  "engines.js",
  "storage.js",
  "security.js",
  "tools.js",
  "types.js",
    "queue.js",
  "node.cjs",
  "bun.js",
  "deno.js",
  "cli.js",
  "headless.js",
  "mcp.js",
  "bridge.js",
  "companion.js",
  "nativehost.template.json",
  "pack.js",
  "http.js",
  "server.js",
  "crossbrowser.js",
  "gallery.json",
  "umd-example.html",
];
const stagedeclarations = [
  "index",
  "policy",
  "protocol",
  "memory",
  "progress",
  "hardening",
  "dashboard",
  /* the os seam declarations of the ownership wave (wave/ownership.getry),
     staged beside their bundles for the same published specifiers. */
  "config",
  "constants",
  "core",
  "data",
  /* the os seam declaration of the provider console move: the paired label
     catalog answers the published ./os specifier the console barrel reads. */
  "os",
  "graph",
  "hono",
  "commands",
  "engines",
  "storage",
  "security",
  "tools",
  "types",
    "queue",
  "cli",
  "headless",
  "mcp",
  "bridge",
  "pack",
  "crossbrowser",
  "http",
  "server",
  "umd",
  "node",
  "bun",
  "deno",
  "companion",
];
for (const file of stagerootfiles) await writeFile(join(stage, file), await readFile(join(root, "build", file)));
for (const name of stagedeclarations) {
  await writeFile(join(stage, `${name}.d.ts`), await readFile(join(root, "build", `${name}.d.ts`)));
  await writeFile(join(stage, `${name}.d.ts.map`), await readFile(join(root, "build", `${name}.d.ts.map`)));
}
for (const group of ["caps", "schemas", "fixtures"]) {
  await mkdir(join(stage, group), { recursive: true });
  const entries: string[] = [];
  const walk = async (relative: string) => {
    for (const entry of await readdir(join(root, "build", group, relative), { withFileTypes: true })) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
      if (entry.isDirectory()) await walk(child);
      else entries.push(child);
    }
  };
  await walk("");
  for (const entry of entries.sort()) {
    const parent = join(stage, group, entry.split("/").slice(0, -1).join("/"));
    await mkdir(parent, { recursive: true });
    await writeFile(join(stage, group, entry), await readFile(join(root, "build", group, entry)));
  }
}
for (const file of ["README.md", "CHANGELOG.md"]) await writeFile(join(stage, file), await readFile(join(root, file)));
await writeFile(join(stage, "manifest.json"), await readFile(join(root, "manifest.json")));

/** The staged package manifest: the repository package.json is the single source of truth, the build derives the published manifest from it — the entry paths remap from the distpackage folder to the package root, the repository machinery (files allowlist, scripts, devDependencies, the packageManager pin) drops out, and every field a registry consumer reads rides verbatim — so the two manifests never drift. */
const remappaths = (node: unknown): unknown => {
  if (typeof node === "string") return node.replace(/^\.\/build\//, "./");
  if (Array.isArray(node)) return node.map(remappaths);
  if (node !== null && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) out[key] = remappaths(value);
    return out;
  }
  return node;
};
const stagedpackage = {
  name: packagejson.name,
  version: packagejson.version,
  description: packagejson.description,
  type: packagejson.type,
  license: packagejson.license,
  author: packagejson.author,
  homepage: packagejson.homepage,
  repository: packagejson.repository,
  bugs: packagejson.bugs,
  keywords: packagejson.keywords,
  /** the runtime dependency set rides the staged manifest verbatim: the server subpath resolves @prisma/client and the libsql adapter at the first database touch, so a consumer that exercises the persistence path finds every runtime dependency installed with the package — the repository machinery (scripts, devDependencies, the packageManager pin) drops out, the runtime contract never does */
  dependencies: packagejson.dependencies,
  engines: packagejson.engines,
  sideEffects: false,
  publishConfig: packagejson.publishConfig,
  main: "./index.js",
  types: "./index.d.ts",
  bin: { devthink: "./cli.js" },
  exports: remappaths(packagejson.exports),
};
await writeFile(join(stage, "package.json"), `${JSON.stringify(stagedpackage, null, 2)}\n`, "utf8");

/** The package scoped checksums: one sha256 line per staged file beside the identity pin of the manifest key, so a consumer verifies every file of the installed package against the build that shipped it — the minified variants and the release archives stay covered by the full build checksums of the release assets, the package set carries its own closed record. */
const stagechecksums = [];
const collectstaged = async (relative: string): Promise<string[]> => {
  const found: string[] = [];
  for (const entry of await readdir(join(stage, relative), { withFileTypes: true })) {
    const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await collectstaged(child)));
    else found.push(child);
  }
  return found;
};
const stagedfiles = (await collectstaged("")).filter((file) => file !== "checksums.txt").sort();
for (const file of stagedfiles) {
  stagechecksums.push(
    `${createHash("sha256")
      .update(await readFile(join(stage, file)))
      .digest("hex")}  ${file}`,
  );
}
stagechecksums.push(`${createHash("sha256").update(identitykey).digest("hex")}  manifest.json key`);
await writeFile(join(stage, "checksums.txt"), `${stagechecksums.join("\n")}\n`, "utf8");

/** The flat layout gates of the staging: no staged path nests past two directories (a folder inside a folder inside a folder never ships), every exports target of the staged manifest resolves to a staged file, and the staged manifest parses with the repository name and version — the organized contract the release lanes assert again over the packed tarball. */
for (const file of stagedfiles) {
  if (file.split("/").length > 3)
    throw new Error(
      `The staged package file ${file} nests past two directories; the npm package stays flat at the root with grouped data beside it.`,
    );
}
const exporttargets: string[] = [];
const collecttargets = (node: unknown) => {
  if (typeof node === "string") exporttargets.push(node);
  else if (Array.isArray(node)) node.forEach(collecttargets);
  else if (node !== null && typeof node === "object") Object.values(node).forEach(collecttargets);
};
collecttargets(stagedpackage.exports);
for (const target of [...new Set(exporttargets)]) {
  try {
    await readFile(join(stage, target.replace(/^\.\//, "")));
  } catch {
    throw new Error(
      `The staged exports target ${target} does not resolve to a staged file; the package manifest and the staged set drifted.`,
    );
  }
}
if (stagedpackage.bin.devthink !== "./cli.js")
  throw new Error("The staged bin entry resolves the cli at the package root.");
console.log(
  `Flat npm package staged: distpackage of ${stagedfiles.length + 1} files (${stagerootfiles.length} root surface files, ${stagedeclarations.length * 2} declaration files, ${stagedfiles.filter((file) => file.startsWith("caps/") || file.startsWith("schemas/") || file.startsWith("fixtures/")).length} grouped data files) with the package scoped checksums and the root manifest — pack it with npm pack ./distpackage.`,
);
}

/* ------------------------------------------------------------------ */
/* section: buildbinary.ts — the bun binary compile lane               */
/* ------------------------------------------------------------------ */
type BunRuntime = {
  build: (options: Record<string, unknown>) => Promise<{ success: boolean; logs: unknown[] }>;
};

function bunRuntime(): BunRuntime {
  const runtime = (globalThis as unknown as { Bun?: BunRuntime }).Bun;
  if (!runtime) throw new Error("Bun is required to compile DevThink binaries.");
  return runtime;
}

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function packageVersion(): string {
  const packageData = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
    version?: string;
  };
  return packageData.version || "0.0.0";
}

function localCompileTarget(): string {
  const os = platform === "darwin" ? "darwin" : platform === "win32" ? "windows" : "linux";
  const cpu = arch === "arm64" ? "arm64" : "x64";
  return `bun-${os}-${cpu}`;
}

export async function buildBinary(): Promise<void> {
  const runtime = bunRuntime();
  const target = flag("--target") || process.env.BUN_TARGET || localCompileTarget();
  const outfile = flag("--outfile") || process.env.DEVTHINK_OUTFILE || `release/devthink-${target}`;
  const result = await runtime.build({
    entrypoints: ["./devthink.ts"],
    target,
    define: { "process.env.DEVTHINK_VERSION": JSON.stringify(packageVersion()) },
    compile: { target, outfile },
    minify: true,
    sourcemap: "none",
  });
  if (!result.success) throw new Error(`Bun compilation failed: ${JSON.stringify(result.logs)}`);
  console.log(`Built ${outfile}`);
}

const directEntry = process.argv[1]?.endsWith("build.ts") || process.argv[1]?.endsWith("build");
const bunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
/* the lane word gates the auto-run so a plain `node build.ts` (the root
   build) never trips the binary lane — run it with `node build.ts binary`. */
if (buildlane === "binary" && (directEntry || bunEntry))
  buildBinary().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Build failed.");
    process.exitCode = 1;
  });

/* ------------------------------------------------------------------ */
/* section: buildlib.ts — the npm library bundle proof                */
/* ------------------------------------------------------------------ */
if (buildlane === "lib") {
/**
 * build-lib — npm library bundle of the @wenathlan/devthink server family
 * one file one responsibility — only the lib build orchestration lives here
 *
 * produces inside build/ (beside the extension bundles test/build.ts emits):
 *   server.js          esm library entry of the server surface (the embedded
 *                      gateway console, transport, auth and library barrel
 *                      beside the maene provider family barrel — one entry)
 *   engine.js          esm engine entry
 *   *.d.ts             declarations of the server family modules
 *
 * the grand merge consolidation interned the server lineage entries
 * (the console, the transport, the request auth and the library
 * barrel in server.ts): the library entries ride the server module the
 * consolidated repository owns, and the engine entry keeps its own name —
 * the server family entries never collide with the extension dist targets
 * (the root build owns server.js itself, this script re-proves the lib pair
 * with the bun compiler and keeps the engine entry alive).
 *
 * run order: test/build.ts FIRST (the root build), then this script.
 * the package is esm only — node engine floor, no cjs output.
 */

const root = process.cwd();

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", cwd: root });
}

// --- esm entries -----------------------------------------------------------

// the ownership wave (wave/ownership.getry) moved the universal gateway engine
// to the getry root: the engine entry bundles the owner's source — the
// @wenathlan/devthink build never carries a second engine copy.
run("bun build ../getry/engine.ts --target=node --format=esm --packages=external --outfile build/engine.js");
console.log("[build-lib] esm engine entry bundled");

// --- declarations ----------------------------------------------------------
// the declaration pass of the root build (tsconfig.build.json includes
// server.ts, and the engine rides the server import graph) already emitted
// the server family declarations beside the extension declarations, so this
// script only proves the pair exists below.

// --- sanity ----------------------------------------------------------------

const required = ["build/server.js", "build/engine.js", "build/server.d.ts", "build/engine.d.ts"];
const missing = required.filter((p) => !existsSync(`${root}/${p}`));
if (missing.length > 0) {
  console.error(`[build-lib] missing bundle artifacts: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("[build-lib] library bundle complete");
}

/* ------------------------------------------------------------------ */
/* section: buildresearchcatalog.ts — the research catalog build       */
/* ------------------------------------------------------------------ */
if (buildlane === "researchcatalog") {
/**
 * Builds the public research catalog from the GitHub search result exports the
 * researchfixtures module carries. The script records source metadata only; it
 * never downloads or executes repository code, and the two derived markdown
 * documents (the public project catalog and the comparative feature and flow
 * matrix) land back inside the researchfixtures module the corpus ships.
 * The ownership wave (wave/ownership.getry) moved the corpus fixtures to the
 * gateway owner: the import rides the library specifier
 * @wenathlan/getry/test/researchfixtures (bridged to the monorepo source) and
 * the in-place rewrite targets the getry copy — the corpus is never duplicated
 * inside devthink.
 */
/* merge fabric: the source file's static import of the getry research
   fixtures rides a dynamic import inside the lane so the root build entry
   (`node build.ts`) never loads the corpus module — the lane loads it at
   exactly the moment the standalone script loaded it. */
const { reposources } = await import("@wenathlan/getry/test/researchfixtures");
const modulepath = join(process.cwd(), "..", "getry", "test", "researchfixtures.ts");
const sourcefiles = Object.keys(reposources)
  .filter((name) => /^repos.*\.json$/i.test(name))
  .sort();
const entries = [];

/** One repository record of the public GitHub search exports the catalog reads. */
interface repositoryentry {
  fullName: string;
  description?: string;
  stargazersCount?: number;
  url: string;
  license?: { key?: string; name?: string };
}

for (const file of sourcefiles) {
  const content = (reposources as Record<string, string>)[file];
  const values = JSON.parse(content.replace(new RegExp(String.fromCharCode(27) + "\\[?[0-?]*[ -/]*[@-~]", "g"), ""));
  if (Array.isArray(values)) entries.push(...values);
}

const unique = new Map();
for (const item of entries) {
  if (!item?.fullName || unique.has(item.fullName)) continue;
  unique.set(item.fullName, item);
}

const ordered = [...unique.values()].sort((left, right) => (right.stargazersCount ?? 0) - (left.stargazersCount ?? 0));
const licensed = ordered.filter((item) => item.license?.key && item.license.key !== "other");
const selected = licensed.slice(0, 50);

function classifyfeature(item: repositoryentry) {
  const text = `${item.fullName} ${item.description ?? ""}`.toLowerCase();
  const signals = [];
  if (/(browser|web)/.test(text)) signals.push("browser context");
  if (/(automation|automate|workflow)/.test(text)) signals.push("workflow automation");
  if (/(agent|ai|llm)/.test(text)) signals.push("agent coordination");
  if (/(extension|webextension|chrome|firefox)/.test(text)) signals.push("extension bridge");
  if (/(mcp|claude)/.test(text)) signals.push("tool protocol bridge");
  if (/(playwright|puppeteer|selenium|test)/.test(text)) signals.push("test driver");
  if (/(vision|screen|screenshot|ocr)/.test(text)) signals.push("visual observation");
  if (/(scrap|extract|crawl)/.test(text)) signals.push("data extraction");
  return signals.length ? signals.join(", ") : "generic browser-agent reference";
}

function classifyflow(item: repositoryentry) {
  const text = `${item.fullName} ${item.description ?? ""}`.toLowerCase();
  if (/(mcp|claude)/.test(text)) return "hypothesis: agent protocol → extension or local bridge → browser action";
  if (/(playwright|puppeteer|selenium|test)/.test(text))
    return "hypothesis: declared task → browser driver → structured result";
  if (/(extension|webextension|chrome|firefox)/.test(text))
    return "hypothesis: extension UI → background runtime → scoped tab interaction";
  return "hypothesis: task request → browser agent → reported outcome";
}

/** Encodes externally supplied repository metadata before it enters generated Markdown. */
function markdownvalue(value: unknown) {
  return encodeURIComponent(String(value ?? ""));
}

/** Accepts only the canonical GitHub repository URL obtained from the public metadata feed. */
function repositoryurl(value: unknown) {
  try {
    const parsed = new URL(String(value));
    if (parsed.protocol !== "https:" || parsed.hostname !== "github.com")
      throw new Error("Non-canonical repository URL.");
    return encodeURI(parsed.toString());
  } catch {
    return "https://github.com/";
  }
}

const rows = selected.map((item, index) => {
  const description = markdownvalue(item.description ?? "No public description supplied by the GitHub search index.");
  return `| ${index + 1} | [${markdownvalue(item.fullName)}](${repositoryurl(item.url)}) | ${markdownvalue(item.license.name)} | ${Number.isSafeInteger(item.stargazersCount) ? item.stargazersCount : 0} | ${description} |`;
});

const matrixrows = selected.map((item, index) => {
  const description = markdownvalue(item.description ?? "No public description supplied by the GitHub search index.");
  return `| ${index + 1} | [${markdownvalue(item.fullName)}](${repositoryurl(item.url)}) | ${markdownvalue(classifyfeature(item))} | ${markdownvalue(classifyflow(item))} | public repository metadata only | ${markdownvalue(item.license.name)}; description: ${description} |`;
});

const markdown = `# Public Open Source Project Catalog\n\nThis catalog is derived from GitHub public-search metadata collected on 2026-08-27. It is an intake list, not an endorsement and not proof that every repository is safe, maintained, or legally reusable. The implementation review phase must confirm the license and inspect only the files needed for interoperability, security and behavior mapping.\n\n## Licensed project sample\n\n| No. | Repository | Declared license | Stars at collection | Public description |\n| --- | --- | --- | ---: | --- |\n${rows.join("\n")}\n\nThe collection contained ${ordered.length} distinct repositories. ${licensed.length} declared a recognized license in GitHub metadata. The first ${selected.length} licensed repositories are retained as the comparative sample; unlicensed or ambiguous repositories are not a code-reuse source.\n\n## Method and limitations\n\nThe catalog combines public GitHub searches for browser automation extensions, browser agents, Firefox automation, Playwright extensions, browser MCP connectors and browser-use agents. Search metadata is useful to establish a public landscape, but it cannot establish implementation quality, exact functionality, browser-store availability or security posture. Those questions are handled in the separate artifact and source review.\n\n## References\n\n[1]: https://github.com/topics/browser-automation "GitHub Topic — browser automation"\n[2]: https://github.com/topics/ai-browser-agent "GitHub Topic — AI browser agent"\n`;

const matrix = `# Comparative Feature and Flow Matrix\n\nThis matrix is intentionally evidence-scoped. Each row represents a public GitHub repository result with a declared license. Feature labels are extracted from public names and descriptions; they are discovery signals, not verified implementation claims. Flow entries are explicit hypotheses to validate in a source or artifact review. No third-party code, branding or private behavior is copied into DevThink.\n\n| No. | Source | Public feature signals | Flow to validate | Evidence class | License and confidence note |\n| --- | --- | --- | --- | --- | --- |\n${matrixrows.join("\n")}\n\n## Reading the matrix\n\nA public listing or repository description can establish only a public claim. A later row in the artifact review will be marked manifest verified only after the downloaded package's manifest is read, and source verified only after an openly licensed source file is inspected. The matrix will retain unverified where neither form of evidence is available.\n\n## References\n\n[1]: https://github.com/topics/browser-automation "GitHub Topic — browser automation"\n[2]: https://github.com/topics/ai-browser-agent "GitHub Topic — AI browser agent"\n`;

/** Escapes one derived markdown document into the template literal body the researchfixtures module carries, so a repository description can never break the module the corpus ships. */
function templatetext(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const moduletext = await readFile(modulepath, "utf8");
let rewrites = 0;
const rewritten = moduletext
  .replace(/export const publicprojectcatalog = `[\s\S]*?`;/, () => {
    rewrites += 1;
    return `export const publicprojectcatalog = \`${templatetext(markdown)}\`;`;
  })
  .replace(/export const featureflowmatrix = `[\s\S]*?`;/, () => {
    rewrites += 1;
    return `export const featureflowmatrix = \`${templatetext(matrix)}\`;`;
  });
if (rewrites !== 2)
  throw new Error(
    `The researchfixtures module carries ${rewrites} of the two catalog template literals the research catalog build rewrites; the module lost a derived document export.`,
  );
await writeFile(modulepath, rewritten, "utf8");
console.log(JSON.stringify({ total: ordered.length, licensed: licensed.length, selected: selected.length }, null, 2));
}

/* ------------------------------------------------------------------ */
/* section: buildusercatalog.ts — the user store catalog build         */
/* ------------------------------------------------------------------ */
if (buildlane === "usercatalog") {
/**
 * Extracts unique Chrome Web Store URLs from the user-provided requirement export.
 * The script creates a source index only and does not fetch, execute or unpack extensions.
 */
const sourcedirectory = join(process.cwd(), "test", "code");
const input = await readFile(join(sourcedirectory, "inputrequirements.txt"), "utf8");
const urls = [...input.matchAll(/https:\/\/chromewebstore\.google\.com\/detail\/[^\s*]+/g)].map((match) => match[0]);
const unique = [...new Set(urls)];
const rows = unique.map((url, index) => {
  const parts = url.split("/");
  const identifier = parts.at(-1) ?? "unknown";
  const slug = decodeURIComponent(parts.at(-2) ?? "unknown").replace(/-/g, " ");
  return `| ${index + 1} | ${slug} | ${identifier} | [Listing](${url}) | manifest inventory retained separately |`;
});

const output = `# User Provided Chrome Web Store Catalog\n\nThis source index extracts the Chrome Web Store URLs supplied by the user. A listing proves that a product page was referenced; it does not prove open-source availability or grant permission to copy code, branding or data.\n\n| No. | Listing label | Chrome extension ID | Source | Review state |\n| --- | --- | --- | --- | --- |\n${rows.join("\n")}\n\nThe companion [artifact inventory](artifactinventory.md) records the evidence-only manifest and file-list review performed where a public CRX payload was available. Third-party package code is never added to this repository.\n`;
await writeFile(join(sourcedirectory, "userstorecatalog.md"), output);
console.log(JSON.stringify({ unique: unique.length }, null, 2));
}

/* ════════════════════════════════════════════════════════════════════ */
/* section: buildterminal.ts — the tsx to terminal converter (the one  */
/* design law: sol rides the terminal through the build conversion)      */
/* ════════════════════════════════════════════════════════════════════ */


/* ---------------------------------------------------------------------------
 * the design tokens (sol.css → the terminal palette)
 * ------------------------------------------------------------------------- */

/** a css style declaration dict as the converter reads it */
export type StyleDict = Record<string, string>;

/** parses the custom property declarations of a stylesheet — first
 * definition wins, so the dark face (the first block of sol.css) is the set
 * the terminal answers: terminals are the dark face of the same design */
export function parseCssTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const match of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
    const name = `--${match[1]}`;
    if (!tokens.has(name)) tokens.set(name, match[2].trim());
  }
  return tokens;
}

/** resolves the var() chain of one value (with fallbacks) through tokens */
export function resolveCssVars(value: string, tokens: Map<string, string>): string {
  let out = value.trim();
  for (let guard = 0; guard < 16; guard++) {
    const use = /var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^()]+)\s*)?\)/.exec(out);
    if (!use) return out;
    const replacement = tokens.get(use[1]) ?? use[2] ?? "";
    out = out.slice(0, use.index) + replacement + out.slice(use.index + use[0].length);
  }
  return out;
}

/** an rgb triple (mirrors the runtime type without importing react land) */
export type Rgb = readonly [number, number, number];

/** converts one css color value to rgb through the token chain — hex,
 * rgb()/rgba() and color-mix (the mix blends over the canvas, the honest
 * approximation of alpha on a terminal that paints text only) */
export function cssColorToRgb(value: string, tokens: Map<string, string>, bg: Rgb = [32, 32, 32]): Rgb | undefined {
  const resolved = resolveCssVars(value, tokens).trim().replace(/^["']|["']$/g, "");
  if (!resolved || resolved === "transparent" || resolved === "none" || resolved === "inherit") return undefined;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(resolved);
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].split("").map((c) => c + c).join("") : hex[1];
    return [
      Number.parseInt(digits.slice(0, 2), 16),
      Number.parseInt(digits.slice(2, 4), 16),
      Number.parseInt(digits.slice(4, 6), 16),
    ] as Rgb;
  }
  const func = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(resolved);
  if (func) return [Number(func[1]), Number(func[2]), Number(func[3])] as Rgb;
  const mix = /^color-mix\(\s*in\s+[a-z-]+\s*,\s*([^,]+?)\s+([\d.]+)%,\s*(.+?)\s*\)$/.exec(resolved);
  if (mix) {
    const fg = cssColorToRgb(mix[1], tokens, bg);
    const pct = Number(mix[2]) / 100;
    if (!fg || pct <= 0) return undefined;
    const rest = mix[3].trim();
    const base = rest === "transparent" ? bg : (cssColorToRgb(rest, tokens, bg) ?? bg);
    return [
      Math.round(fg[0] * pct + base[0] * (1 - pct)),
      Math.round(fg[1] * pct + base[1] * (1 - pct)),
      Math.round(fg[2] * pct + base[2] * (1 - pct)),
    ] as Rgb;
  }
  return undefined;
}

/* ---------------------------------------------------------------------------
 * the jsx reader (a lightweight structural scan — no compiler dependency)
 * ------------------------------------------------------------------------- */

export type JsxAttr = { name: string; value: string; form: "string" | "expr" | "none" };
export type JsxChild =
  | { type: "element"; element: JsxElement }
  | { type: "text"; text: string }
  | { type: "slot"; expr: string };
export type JsxElement = { tag: string; attrs: JsxAttr[]; children: JsxChild[] };

/** reads one balanced brace region (strings and nesting respected) */
function readBalanced(source: string, start: number, open: string = "{", close: string = "}"): { content: string; next: number } {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (inStr) {
      if (char === inStr && source[i - 1] !== "\\") inStr = null;
      continue;
    }
    if (char === '"' || char === "'") {
      inStr = char;
      continue;
    }
    if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return { content: source.slice(start + 1, i), next: i + 1 };
    }
  }
  return { content: source.slice(start + 1), next: source.length };
}

/** parses the attributes of one open tag */
function parseAttrs(source: string, start: number): { attrs: JsxAttr[]; next: number; selfClose: boolean } {
  const attrs: JsxAttr[] = [];
  let i = start;
  for (;;) {
    while (i < source.length && /\s/.test(source[i])) i += 1;
    if (source.startsWith("/>", i)) return { attrs, next: i + 2, selfClose: true };
    if (source[i] === ">") return { attrs, next: i + 1, selfClose: false };
    const name = /^[A-Za-z_:@][\w:.-]*/.exec(source.slice(i));
    if (!name) {
      i += 1;
      continue;
    }
    i += name[0].length;
    while (i < source.length && /\s/.test(source[i])) i += 1;
    if (source[i] !== "=") {
      attrs.push({ name: name[0], value: "", form: "none" });
      continue;
    }
    i += 1;
    while (i < source.length && /\s/.test(source[i])) i += 1;
    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      const end = source.indexOf(quote, i + 1);
      attrs.push({ name: name[0], value: source.slice(i + 1, end), form: "string" });
      i = end + 1;
    } else if (source[i] === "{") {
      const region = readBalanced(source, i);
      attrs.push({ name: name[0], value: region.content, form: "expr" });
      i = region.next;
    } else {
      const bare = /^[^\s>]+/.exec(source.slice(i));
      attrs.push({ name: name[0], value: bare?.[0] ?? "", form: "string" });
      i += bare?.[0].length ?? 0;
    }
  }
}

/** parses the children of one element until its closing tag (or a
 * fragment's closer) — text, nested elements, slots and jsx comments */
function parseChildrenUntil(source: string, start: number, closer: string): { children: JsxChild[]; next: number } {
  const children: JsxChild[] = [];
  let i = start;
  while (i < source.length) {
    if (source.startsWith(closer, i)) return { children, next: i + closer.length };
    const char = source[i];
    if (/\s/.test(char)) {
      i += 1;
      continue;
    }
    if (char === "<") {
      if (source.startsWith("<>", i)) {
        const inner = parseChildrenUntil(source, i + 2, "</>");
        children.push(...inner.children);
        i = inner.next;
        continue;
      }
      const element = parseElementAt(source, i);
      children.push({ type: "element", element: element.element });
      i = element.next;
      continue;
    }
    if (char === "{") {
      const region = readBalanced(source, i);
      i = region.next;
      const expr = region.content.trim();
      if (expr.startsWith("/*") || expr.length === 0) continue;
      children.push({ type: "slot", expr });
      continue;
    }
    let j = i;
    while (j < source.length && !"<{".includes(source[j])) j += 1;
    const text = source.slice(i, j).trim();
    if (text) children.push({ type: "text", text });
    i = j;
  }
  return { children, next: i };
}

/** parses one element starting at a `<` followed by a tag name */
function parseElementAt(source: string, start: number): { element: JsxElement; next: number } {
  const name = /^[A-Za-z][\w.]*/.exec(source.slice(start + 1));
  const tag = name?.[0] ?? "div";
  const after = parseAttrs(source, start + 1 + tag.length);
  if (after.selfClose) return { element: { tag, attrs: after.attrs, children: [] }, next: after.next };
  const rest = parseChildrenUntil(source, after.next, `</${tag}>`);
  return { element: { tag, attrs: after.attrs, children: rest.children }, next: rest.next };
}

/** reads the root JSX element of a widget source (the element the return
 * mounts; falls back to the first tag in the file) */
export function parseJsxRoot(source: string): JsxElement | undefined {
  const returnAt = source.indexOf("return (");
  const scanFrom = returnAt >= 0 ? returnAt : 0;
  const tagAt = source.slice(scanFrom).search(/<[A-Za-z]/);
  if (tagAt < 0) return undefined;
  return parseElementAt(source, scanFrom + tagAt).element;
}

/* ---------------------------------------------------------------------------
 * the style contracts (the exported CSSProperties objects of the wingets)
 * ------------------------------------------------------------------------- */

/** scans one value until the next comma/brace at depth zero */
function scanStyleValue(text: string, start: number): { value: string; next: number } {
  let i = start;
  let depth = 0;
  let inStr: string | null = null;
  const buf: string[] = [];
  while (i < text.length) {
    const char = text[i];
    if (inStr) {
      buf.push(char);
      if (char === inStr && text[i - 1] !== "\\") inStr = null;
      i += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      inStr = char;
      buf.push(char);
      i += 1;
      continue;
    }
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth -= 1;
    if (depth === 0 && (char === "," || char === "}")) break;
    buf.push(char);
    i += 1;
  }
  return { value: buf.join("").trim(), next: i };
}

/** parses one style object literal (spreads resolved through contracts;
 * spread calls — the motion entrances — drop, the terminal holds still) */
export function parseStyleObject(text: string, contracts: Record<string, StyleDict> = {}): StyleDict {
  let body = text.trim();
  if (body.startsWith("{")) body = readBalanced(body, 0).content;
  const out: StyleDict = {};
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /[\s,]/.test(body[i])) i += 1;
    if (i >= body.length) break;
    if (body.startsWith("...", i)) {
      const ident = /^[A-Za-z_$][\w$]*/.exec(body.slice(i + 3));
      if (!ident) {
        i += 3;
        continue;
      }
      let end = i + 3 + ident[0].length;
      if (body[end] === "(") {
        // a spread call (stagedEntrance) — skip to the closing paren
        let depth = 0;
        let j = end;
        for (; j < body.length; j++) {
          if (body[j] === "(") depth += 1;
          else if (body[j] === ")") {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        end = j + 1;
      } else {
        Object.assign(out, contracts[ident[0]] ?? {});
      }
      i = end;
      continue;
    }
    const prop = /^([a-zA-Z-]+)\s*:\s*/.exec(body.slice(i));
    if (!prop) {
      i += 1;
      continue;
    }
    i += prop[0].length;
    const value = scanStyleValue(body, i);
    out[prop[1]] = value.value;
    i = value.next;
  }
  return out;
}

/** collects the exported CSSProperties contracts of one winget file */
export function collectStyleContracts(source: string): Record<string, StyleDict> {
  const contracts: Record<string, StyleDict> = {};
  for (const match of source.matchAll(/export const (\w+)\s*:\s*CSSProperties\s*=\s*\{/g)) {
    const openAt = match.index + match[0].length - 1;
    const region = readBalanced(source, openAt);
    contracts[match[1]] = parseStyleObject(region.content);
  }
  return contracts;
}

/* ---------------------------------------------------------------------------
 * the conversion (jsx + styles + tokens → the terminal IR)
 * ------------------------------------------------------------------------- */

/** the conversion context: the contracts of the imported wingets, the css
 * tokens, the discovered prop slots and the item binding of a map scope */
export type ConvertContext = {
  contracts: Record<string, StyleDict>;
  tokens: Map<string, string>;
  slots: Set<string>;
  item?: string;
};

/** the widgets the pipeline converts today (the shell + the two proof
 * widgets — the map generalizes to every winget) */
export const TERMINAL_WIDGETS: ReadonlyArray<{ source: string; output: string; exportName: string }> = [
  { source: "sol/wingets/Controlshell.tsx", output: "shellterminal.ts", exportName: "ControlShellTerminal" },
  { source: "sol/wingets/ShellChip.tsx", output: "chipterminal.ts", exportName: "ChipTerminal" },
  { source: "sol/wingets/ShellKbd.tsx", output: "kbdterminal.ts", exportName: "KbdTerminal" },
];

function attrValue(element: JsxElement, name: string): JsxAttr | undefined {
  return element.attrs.find((attr) => attr.name === name);
}

function classNames(element: JsxElement): string[] {
  const attr = attrValue(element, "className");
  if (!attr) return [];
  return attr.value.split(/\s+/).filter(Boolean);
}

/** resolves the style dict of one element: the contract identifier, the
 * inline object (spreads included) or the empty dict */
function styleOf(element: JsxElement, ctx: ConvertContext): StyleDict {
  const attr = attrValue(element, "style");
  if (!attr) return {};
  const raw = attr.value.trim();
  if (attr.form === "string") return parseStyleObject(raw, ctx.contracts);
  if (raw.startsWith("{")) return parseStyleObject(raw, ctx.contracts);
  if (/^[A-Za-z_$][\w$]*$/.test(raw)) return ctx.contracts[raw] ?? {};
  return parseStyleObject(raw, ctx.contracts);
}

/** the font shorthand → weight and scale flags (sizes fold to the three
 * terminal scale classes; tracking drops — a cell cannot track) */
function fontFlags(value: string): { bold?: boolean; scale?: "display" | "body" | "micro" } {
  const clean = value.replace(/^["']|["']$/g, "");
  const match = /(\d{3})\s+(\d+(?:\.\d+)?)px/.exec(clean);
  if (!match) return {};
  const weight = Number(match[1]);
  const size = Number(match[2]);
  return { bold: weight >= 600 ? true : undefined, scale: size >= 24 ? "display" : size <= 11 ? "micro" : "body" };
}

/** the tailwind arbitrary utilities of a className (gap-[18px] and the
 * bracket paddings ride the same px→cell map) */
function tailwindArbitrary(classes: string[]): { gap?: number; padY?: number; padX?: number } {
  const out: { gap?: number; padY?: number; padX?: number } = {};
  for (const cls of classes) {
    const gap = /^gap-\[([\d.]+)px\]$/.exec(cls);
    if (gap) out.gap = Number(gap[1]);
    const pad = /^p[tblrxy]?-\[([\d.]+)px\]$/.exec(cls);
    if (pad) out.padY = Number(pad[1]);
  }
  return out;
}

/** converts one jsx element into the terminal IR */
export function convertElement(element: JsxElement, ctx: ConvertContext): IrNode {
  const style = styleOf(element, ctx);
  const classes = classNames(element);
  const tw = tailwindArbitrary(classes);
  const display = style.display ?? "";
  const flexDirection = style.flexDirection === "row" || display.includes("inline-flex") ? "row" : style.flexDirection === "column" ? "column" : "column";
  const isTextTag = ["p", "h1", "h2", "h3", "h4", "span", "kbd", "button", "strong", "em", "code", "small", "label", "a", "li"].includes(element.tag);
  const toneAttr = attrValue(element, "data-tone");

  // the mounted chrome (the navbar widget) answers the terminal chrome band;
  // every other childless component is a face this pass does not convert —
  // it renders nothing rather than a wrong guess (its own conversion ride)
  if (/^[A-Z]/.test(element.tag)) {
    if (element.tag === "ShellChrome") return { kind: "chrome" };
    if (element.children.length === 0) return { kind: "box", direction: "column", gap: 0, children: [] };
  }

  // the child slots: text, props, optionals, maps, children passthrough
  const childNodes: IrNode[] = [];
  for (const child of element.children) {
    if (child.type === "text") {
      childNodes.push({ kind: "text", text: child.text });
      continue;
    }
    if (child.type === "element") {
      childNodes.push(convertElement(child.element, ctx));
      continue;
    }
    const expr = child.expr;
    if (/^[A-Za-z_$][\w$]*$/.test(expr)) {
      ctx.slots.add(expr);
      if (expr === "children") childNodes.push({ kind: "children" });
      else if (ctx.item === expr) childNodes.push({ kind: "text", item: expr });
      else childNodes.push({ kind: "text", slot: expr });
      continue;
    }
    const optional = /^([A-Za-z_$][\w$]*)\s*\?\s*([\s\S]+?)\s*:\s*null$/.exec(expr);
    if (optional) {
      ctx.slots.add(optional[1]);
      const body = optional[2];
      const tagAt = body.search(/<[A-Za-z]/);
      if (tagAt >= 0) {
        const inner = parseElementAt(body, tagAt).element;
        const node = convertElement(inner, ctx);
        if (node.kind === "box" || node.kind === "text") node.when = optional[1];
        childNodes.push(node);
      }
      continue;
    }
    const map = /^([A-Za-z_$][\w$]*)\.map\(\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*=>\s*([\s\S]+)$/.exec(expr);
    if (map) {
      ctx.slots.add(map[1]);
      const body = map[3];
      const tagAt = body.search(/<[A-Za-z]/);
      if (tagAt >= 0) {
        const inner = parseElementAt(body, tagAt).element;
        const child = convertElement(inner, { ...ctx, item: map[2] });
        childNodes.push({ kind: "map", slot: map[1], item: map[2], gap: 1, child });
      }
      continue;
    }
    // a plain expression with jsx islands folds to the island; string
    // literals fold to text — anything else drops (handlers stay web-side)
    const tagAt = expr.search(/<[A-Za-z]/);
    if (tagAt >= 0) {
      childNodes.push(convertElement(parseElementAt(expr, tagAt).element, ctx));
      continue;
    }
    const literal = /^["'](.*)["']$/.exec(expr);
    if (literal) childNodes.push({ kind: "text", text: literal[1] });
  }

  if (isTextTag || (childNodes.length === 1 && childNodes[0].kind === "text" && element.children.every((c) => c.type !== "element"))) {
    // a leaf text element: the first text/prop/item child rides the tags own
    // style (color, weight, scale, the keycap brackets and chip tones)
    const flags = fontFlags(style.font ?? "");
    const color = style.color ? cssColorToRgb(style.color, ctx.tokens) : undefined;
    // inside a text element the children slot reads as its string content
    const textish = childNodes.map((node) => (node.kind === "children" ? ({ kind: "text", slot: "children" } as IrNode) : node));
    const text = textish.find((node) => node.kind === "text");
    if (text && text.kind === "text" && textish.every((node) => node.kind !== "box" && node.kind !== "map")) {
      const only = textish.length === 1;
      const node: IrNode = {
        kind: "text",
        ...(text.text !== undefined ? { text: text.text } : {}),
        ...(text.slot !== undefined ? { slot: text.slot } : {}),
        ...(text.item !== undefined ? { item: text.item } : {}),
        ...(color ? { color } : {}),
        ...flags,
        ...(toneAttr?.form === "expr" ? { toneSlot: toneAttr.value.trim() } : {}),
        ...(classes.includes("kbd") ? { deco: "bracket" as const } : {}),
        ...(classes.includes("uichip") && only ? { deco: "paren" as const } : {}),
        ...(text.when !== undefined ? { when: text.when } : {}),
      };
      if (!only) {
        // multiple text children (the chip: content + remove glyph) fold to
        // a row so the pill reads on one line — the tone rides the content
        const first = textish[0];
        if (toneAttr?.form === "expr" && first?.kind === "text") first.toneSlot = toneAttr.value.trim();
        return {
          kind: "box",
          direction: "row",
          gap: 1,
          ...(classes.includes("uichip") ? { deco: "paren" as const } : {}),
          children: textish,
        };
      }
      return node;
    }
  }

  // a container element: the flex/grid rhythm → the box
  const gapPx = (() => {
    const raw = style.gap ?? style.rowGap ?? style.columnGap;
    if (raw !== undefined) return Number.parseFloat(raw);
    return tw.gap;
  })();
  const gap = flexDirection === "row" ? pxToCellX(gapPx ?? 8) : pxToCellY(gapPx ?? 16);
  const padding = (style.padding ?? "").replace(/["']/g, "");
  const pads = padding.split(/\s+/).filter(Boolean).map((token) => Number.parseFloat(token) || 0);
  const padY = pads.length >= 1 ? Math.max(1, Math.round(((pads[0] ?? 0) + (pads.length === 2 ? pads[0] : (pads[2] ?? pads[0]))) / 2 / 16)) : undefined;
  const padX = pads.length >= 2 ? Math.max(0, Math.round(pads[1] / 8)) : undefined;
  return {
    kind: "box",
    direction: flexDirection === "row" ? "row" : "column",
    gap,
    ...(style.borderBottom ? { rule: true } : {}),
    ...(style.boxShadow ? { border: true } : {}),
    ...(padX ? { padX } : {}),
    ...(padY ? { padY } : {}),
    children: childNodes,
  };
}

/** converts one widget source into its terminal IR (tokens + contracts ride
 * the imports of the file) */
export function convertWidget(source: string, cssTokens: Map<string, string>): { ir: IrNode; slots: string[] } {
  const contracts: Record<string, StyleDict> = {};
  for (const match of source.matchAll(/from\s+"\.\/([\w]+)\.tsx"/g)) {
    const sibling = path.resolve(import.meta.dirname ?? ".", "sol", "wingets", `${match[1]}.tsx`);
    if (existsSync(sibling)) Object.assign(contracts, collectStyleContracts(readFileSync(sibling, "utf8")));
  }
  const root = parseJsxRoot(source);
  if (!root) throw new Error("no jsx root found in the widget source");
  const ctx: ConvertContext = { contracts, tokens: cssTokens, slots: new Set() };
  const ir = convertElement(root, ctx);
  return { ir, slots: [...ctx.slots].sort() };
}

/* ---------------------------------------------------------------------------
 * the emitter (IR → the committed terminal module)
 * ------------------------------------------------------------------------- */

/** emits one terminal module: the IR as a typed constant plus the props
 * function with the SAME prop slots the web widget answers */
export function emitTerminalModule(options: { exportName: string; sourcePath: string; ir: IrNode; slots: string[] }): string {
  const { exportName, sourcePath, ir, slots } = options;
  const propsType = `Record<string, unknown>`;
  const slotDoc = slots.length > 0 ? slots.map((slot) => `\`string\``).join(", ") : "none";
  return `/**
 * GENERATED FILE — the terminal face of ${sourcePath}.
 * emitter: devthink/buildterminal.ts (the tsx→terminal conversion of wave
 * 2-c / PR11): the same design, the same tokens, the cell as the unit. The
 * prop slots the web widget answers survive verbatim (${slotDoc}) — the
 * interactivity contract rides the conversion. Regenerate with
 * \`node buildterminal.ts\` — never edit by hand.
 */
import { render, type IrNode, type RenderOptions } from "./runtime.ts";

const ir: IrNode = ${JSON.stringify(ir, null, 2)};

export type ${exportName}Props = ${propsType};

/** renders the ${sourcePath} face into terminal rows (ANSI, headless) */
export function ${exportName}(props: ${exportName}Props = {}, options: RenderOptions = {}): string {
  return render(ir, props, options);
}
`;
}

/** converts every configured widget; returns the output files in memory */
export function convertAll(): Array<{ output: string; content: string; slots: string[] }> {
  const root = import.meta.dirname ?? ".";
  const css = readFileSync(path.resolve(root, "sol", "sol.css"), "utf8");
  const tokens = parseCssTokens(css);
  return TERMINAL_WIDGETS.map((widget) => {
    const source = readFileSync(path.resolve(root, widget.source), "utf8");
    const { ir, slots } = convertWidget(source, tokens);
    return {
      output: widget.output,
      slots,
      content: emitTerminalModule({ exportName: widget.exportName, sourcePath: widget.source, ir, slots }),
    };
  });
}

/* ---------------------------------------------------------------------------
 * the cli: write (default) or verify (--check)
 * ------------------------------------------------------------------------- */

function main(): void {
  const check = process.argv.includes("--check");
  const root = import.meta.dirname ?? ".";
  const files = convertAll();
  let drift = 0;
  for (const file of files) {
    const target = path.resolve(root, file.output);
    if (check) {
      const current = existsSync(target) ? readFileSync(target, "utf8") : "";
      if (current !== file.content) {
        drift += 1;
        console.error(`drift: ${file.output} does not match the conversion of the current widgets`);
      } else {
        console.log(`ok: ${file.output} (${file.slots.length} prop slots survive)`);
      }
    } else {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, file.content);
      console.log(`converted ${file.output} (${file.slots.length} prop slots survive)`);
    }
  }
  if (check && drift > 0) process.exitCode = 1;
}

/* the lane dispatch of the build family (the flat folder law): the
 * terminal lane answers `node build.ts terminal [--check]` — the argv[2]
 * lane word the dispatcher retires keeps the standalone-era flags
 * (--check reads the same drift verdict) exactly as they were. */
if (buildlane === "terminal") main();
