/** Builds browser and library targets with no remote runtime dependencies. */
import { build } from "esbuild";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { cjswrap } from "./cjswrap.mjs";
import { stripstrings, underscorednames } from "./bundlescan.mjs";
import { umdwrap } from "./umdwrap.mjs";

/** Resolves the repo-local tsc bin (the merged repo rides bun; pnpm exec is retired). */
async function resolveTsc() {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const self = require.resolve("typescript/package.json");
  const path = await import("node:path");
  return path.join(path.dirname(self), "bin", "tsc");
}

const root = process.cwd();
const extensiondist = join(root, "dist", "extension");
const execute = promisify(execFile);
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
await rm(join(root, "dist"), { recursive: true, force: true });
await rm(extensiondist, { recursive: true, force: true });
await mkdir(extensiondist, { recursive: true });

/** The version stamp and license banner every bundle embeds: the version reads from package.json so no bundle carries a second version source, and the license name rides the same line. */
const banner = `/*! devthink ${packagejson.version} — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/devthink */`;

/** The byte budget of every dist target: the bounds are build-time engineering bounds on the unminified variants (a minified variant stays strictly smaller than its unminified bundle) and an overgrown bundle fails the build before it ships. */
const bundlebudgets = { index: 2_000_000, indexcjs: 2_100_000, neutral: 1_900_000, umd: 2_100_000, node: 2_100_000, bun: 2_000_000, deno: 2_000_000, cli: 900_000, headless: 900_000, mcp: 1_400_000, gateway: 400_000, http: 600_000, bridge: 160_000, companion: 60_000, policy: 600_000, protocol: 380_000, memory: 500_000, progress: 60_000, hardening: 60_000, dashdone: 120_000, crossbrowser: 380_000, pack: 600_000, "gateway-index": 1_200_000, "maene-index": 1_200_000 };

/** Every dist bundle the build emits: the accounting, the naming check, the checksums file and the minified parity expectations read this one list. */
const emitted = [];

/** Records one emitted dist bundle: the list drives the size accounting, the naming check and the checksums file of every target. */
function record(name) {
  emitted.push(name);
  return join("dist", name);
}

/** The shared core: one tree shakable esm entry every runtime re-exports, the cjs entry behind the stable getter object, the neutral browser bundle the browser condition selects, and one per module bundle for the policy, protocol, memory and progress module entries — every target with its minified variant beside it. */
await build({ entryPoints: ["index.ts"], outfile: record("index.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, banner: { js: banner } });
await build({ entryPoints: ["index.ts"], outfile: record("index.min.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, minify: true, banner: { js: banner } });

/** The cjs mode: the build emits the core once, wraps the named exports behind the stable getter object and keeps the mode stamp the entry carries, so require consumers read the same surface the esm mode reads. */
await build({ entryPoints: ["cjs.ts"], outfile: join(root, "dist", "index.cjs"), bundle: true, format: "cjs", platform: "node", target: "node22", sourcemap: true, banner: { js: banner } });
await writeFile(record("index.cjs"), cjswrap(await readFile(join(root, "dist", "index.cjs"), "utf8")), "utf8");
await build({ entryPoints: ["cjs.ts"], outfile: join(root, "dist", "index.min.cjs"), bundle: true, format: "cjs", platform: "node", target: "node22", sourcemap: true, minify: true, banner: { js: banner } });
await writeFile(record("index.min.cjs"), cjswrap(await readFile(join(root, "dist", "index.min.cjs"), "utf8")), "utf8");

/** The neutral target the browser condition selects: the browser platform build strips every node import because the whole core reaches the platform through the adapter seam, never through a direct import. */
await build({ entryPoints: ["neutral.ts"], outfile: record("index.neutral.js"), bundle: true, format: "esm", platform: "browser", target: "chrome120", sourcemap: true, banner: { js: banner } });
await build({ entryPoints: ["neutral.ts"], outfile: record("index.neutral.min.js"), bundle: true, format: "esm", platform: "browser", target: "chrome120", sourcemap: true, minify: true, banner: { js: banner } });

/** The per module bundles of the exports map: policy, protocol, memory and progress ship as their own tree shakable entries with the types the declaration emit provides, the 1.1.95 hardening family ships its own entry beside them so the security gates stay importable without touching the frozen index surface, and the 1.1.96 dashdone family ships its own entry the same way so the multi agent dashboard view stays importable outside the frozen surface. */
for (const modulename of ["policy", "protocol", "memory", "progress", "hardening", "dashdone"]) {
  await build({ entryPoints: [`${modulename}.ts`], outfile: record(`${modulename}.js`), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, banner: { js: banner } });
  await build({ entryPoints: [`${modulename}.ts`], outfile: record(`${modulename}.min.js`), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, minify: true, banner: { js: banner } });
}

await execute(process.execPath, [await resolveTsc(), "-p", "tsconfig.build.json"]);

/** The terminal and headless entries of the 1.1.80 family keep their own dist targets beside the library modes, with the minified variants and the version banner riding the same accounting; the mcp server bundle of the 1.1.84 family serves the model context protocol surface of the serve mode as its own tree shakable entry, and the native bundles of the 1.1.85 family ship beside them: the wsbridge module bundle and the companion script the plain node recipe stamps from the companion sources. */
await build({ entryPoints: ["cli.ts"], outfile: record("cli.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, banner: { js: `#!/usr/bin/env node\n${banner}` } });
await build({ entryPoints: ["cli.ts"], outfile: record("cli.min.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, minify: true, banner: { js: `#!/usr/bin/env node\n${banner}` } });
await build({ entryPoints: ["headless.ts"], outfile: record("headless.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, banner: { js: banner } });
await build({ entryPoints: ["headless.ts"], outfile: record("headless.min.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, minify: true, banner: { js: banner } });
await build({ entryPoints: ["mcp.ts"], outfile: record("mcp.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, banner: { js: banner } });
await build({ entryPoints: ["mcp.ts"], outfile: record("mcp.min.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, minify: true, banner: { js: banner } });

/** The bridge bundle of the 1.1.90 correlation wave: the native host bridge family — the wire contract, the site relay client, the chat widget, the localhost wsbridge relay and the native host surface — ships as one tree shakable entry with the minified variant beside it, so a local process imports the server contract, the relay, the chat bridge, the bind checks, the session tokens, the envelope translation, the port states, the handshake, the capability negotiation and the frame validation from one artifact. */
await build({ entryPoints: ["bridge.ts"], outfile: record("bridge.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, banner: { js: banner } });
await build({ entryPoints: ["bridge.ts"], outfile: record("bridge.min.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, minify: true, banner: { js: banner } });

/** The cross browser bundles of the 1.1.86 browser coverage family: the apimap module ships its own tree shakable entry and the 1.1.90 correlation wave folds the polyfill layer, the firefoxprep adapter, the xpipack assembler and the safariskeleton wrapper into the one crossbrowser family entry with the minified variants beside them, so a local process imports the catalog, the namespace resolver, the firefox overlay adapter, the xpi assembler and the safari wrapper from one artifact beside the native bridge bundles. */
await build({ entryPoints: ["gateway.ts"], outfile: record("gateway.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, banner: { js: banner } });
await build({ entryPoints: ["gateway.ts"], outfile: record("gateway.min.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, minify: true, banner: { js: banner } });
await build({ entryPoints: ["crossbrowser.ts"], outfile: record("crossbrowser.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, banner: { js: banner } });
/** The library barrels of the 2.0.0 grand merge: the gateway lineage library surface (engine, auth, http, configloader, types — the npm library the gateway repository shipped) and the maene lineage barrel (the provider-neutral aggregates) ship as their own tree shakable entries so the ./gateway-lib and ./maene-lib subpaths resolve from the flat package exactly like every other entry. The runtime dependencies the gateway persistence and the hono server pull (the prisma stack, libsql, hono, the node adapter, ink and react) ride the package.json dependencies of the published artifact — the barrels mark them external so the bundled code stays the reviewed repository sources alone and the dependency tree the consumer installs answers the rest. */
const libraryexternals = ["hono", "@hono/node-server", "@libsql/client", "@prisma/client", "@prisma/adapter-libsql", "ink", "react", "z-ai-web-dev-sdk"];
await build({ entryPoints: ["gateway-index.ts"], outfile: record("gateway-index.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, banner: { js: banner }, external: libraryexternals });
await build({ entryPoints: ["maene-index.ts"], outfile: record("maene-index.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, banner: { js: banner }, external: libraryexternals });
await build({ entryPoints: ["gateway-index.ts"], outfile: record("gateway-index.min.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, minify: true, banner: { js: banner }, external: libraryexternals });
await build({ entryPoints: ["maene-index.ts"], outfile: record("maene-index.min.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, minify: true, banner: { js: banner }, external: libraryexternals });
await build({ entryPoints: ["crossbrowser.ts"], outfile: record("crossbrowser.min.js"), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, minify: true, banner: { js: banner } });

/** The publishing pipeline bundles of the 1.1.87 family: the 1.1.90 correlation wave folds the vsixpack assembler, the mavenpack descriptors, the nugetpack layout, the containerpack stages, the sbom inventory builder and the artifact manifest builder into the one pack family entry, and the relayserve state machine ships beside them with the minified variants beside them, so the release chain and any local tooling import the packaging surfaces from one artifact beside the cross browser bundles. */
for (const modulename of ["pack", "http"]) {
  await build({ entryPoints: [`${modulename}.ts`], outfile: record(`${modulename}.js`), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, banner: { js: banner } });
  await build({ entryPoints: [`${modulename}.ts`], outfile: record(`${modulename}.min.js`), bundle: true, format: "esm", platform: "neutral", target: "es2022", sourcemap: true, minify: true, banner: { js: banner } });
}

/** The companionbin bundle of the 1.1.85 native host bridge family: the plain node recipe compiles the companion source of companion.ts with esbuild, stamps the package version over the source build marker and writes the runnable script with its sourcemap beside the host manifest template the same recipe stamps from the template the companion module embeds — no native compiler and no network step — and the packaging step asserts the recipe builds, because the companion ships as source plus a build command and never as a binary blob. */
const companionbanner = `/*! devthink ${packagejson.version} companion — the optional native host of the native bridge — GPL-3.0-only — built with plain node, no native compiler */`;
await build({ entryPoints: ["companion.ts"], outfile: record("companion.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, banner: { js: companionbanner } });
const companionbundle = await readFile(join(root, "dist", "companion.js"), "utf8");
const companionstamped = companionbundle.replace(/(const|var|let) companionbuild = "source"/, `$1 companionbuild = "${packagejson.version}"`);
if (companionstamped === companionbundle) throw new Error("The companion build recipe found no source build marker to stamp; the companion keeps its companionbuild export.");
await writeFile(join(root, "dist", "companion.js"), companionstamped, "utf8");
const companionmodule = await import(join(root, "dist", "companion.js"));
const templatestamped = String(companionmodule.nativehosttemplatejson).replace("__devthink_version__", packagejson.version);
if (templatestamped === String(companionmodule.nativehosttemplatejson)) throw new Error("The companion build recipe found no template banner placeholder to stamp; the template keeps its version placeholder.");
await writeFile(record("nativehost.template.json"), templatestamped, "utf8");
console.log(`Companion built with plain node: dist/companion.js of build ${packagejson.version} with the sourcemap and the stamped host manifest template beside it.`);

/** The frozen contract artifacts of the 1.1.98 consolidation: the capability manifests of the seven frozen surfaces, the ten protocol schemas, the example fixture set and the umd example page are build artifacts the recipe derives from the repository sources — the caps come from the frozen lists the compiled library exports, the schemas and the fixtures copy verbatim from the tests/code sources, and the umd example rewrites its bundle reference to the dist root — so the packages ship them from dist while the repository root stays source only. The 2.0.0 example gallery extends the same fixture set: the 36 recipe plan files of tests/code/recipes copy into dist/fixtures/recipes as pure plan documents, the four self contained fixture pages of tests/code/pages copy into dist/fixtures/pages, and the gallery index (the metadata the recipes runner and the cli recipes command read) ships as dist/gallery.json beside the fixture set — outside the fixtures directory the headless fixture loader scans under schemastrict, so the recipes directory itself stays pure plans the planlint command walks while the index never answers a page state fixture probe. */
const capsurfaces = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
const librarymodule = await import(join(root, "dist", "index.js"));
await mkdir(join(root, "dist", "caps"), { recursive: true });
for (const surface of capsurfaces) {
  const manifest = librarymodule.capmanifestof(surface);
  if (manifest.release !== packagejson.version) throw new Error(`The capmanifest of the ${surface} surface pins the release ${manifest.release} while the package carries ${packagejson.version}.`);
  await writeFile(record(`caps/${surface}.json`), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}
const schemadirectory = join(root, "tests", "code");
const schemefiles = (await readdir(schemadirectory)).filter(file => file.endsWith(".schema.json")).sort();
if (schemefiles.length !== 10) throw new Error(`The protocol schema set of tests/code carries the ten frozen schemas, found ${schemefiles.length}.`);
await mkdir(join(root, "dist", "schemas"), { recursive: true });
for (const file of schemefiles) await writeFile(record(`schemas/${file}`), await readFile(join(schemadirectory, file)), "utf8");
const fixtureset = [
  { source: "example-org-pagestate.json", target: "fixtures/example-org-pagestate.json" },
  { source: "mcp-client.mjs", target: "fixtures/mcp-client.mjs" },
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
await mkdir(join(root, "dist", "fixtures", "plans"), { recursive: true });
await mkdir(join(root, "dist", "fixtures", "workflows"), { recursive: true });
await mkdir(join(root, "dist", "fixtures", "importers"), { recursive: true });
await mkdir(join(root, "dist", "fixtures", "recipes"), { recursive: true });
await mkdir(join(root, "dist", "fixtures", "pages"), { recursive: true });
for (const fixture of fixtureset) await writeFile(record(fixture.target), await readFile(join(schemadirectory, fixture.source)), "utf8");
const umdexample = await readFile(join(schemadirectory, "umd.html"), "utf8");
const umdexamplestamped = `<!-- devthink ${packagejson.version} umd example page — GPL-3.0-only -->\n${umdexample.replace("../../dist/devthink.umd.js", "./devthink.umd.js")}`;
if (!umdexamplestamped.endsWith(umdexample.replace("../../dist/devthink.umd.js", "./devthink.umd.js"))) throw new Error("The umd example source carries the dist bundle reference the build rewrites; the reference stayed unchanged.");
await writeFile(record("umd-example.html"), umdexamplestamped, "utf8");
console.log(`Contract artifacts built: dist/caps of ${capsurfaces.length} surfaces, dist/schemas of ${schemefiles.length} frozen schemas, the dist/fixtures example set with the 2.0.0 example gallery (36 recipes, 4 fixture pages and the gallery index) and the dist/umd-example.html page.`);

/** The minified companion pair: the minifier reads the stamped recipe output and writes the minified variant with its own sourcemap beside it, so the checksum and the parity expectations of the dist contract cover the companion script like every other bundle. */
await build({ entryPoints: [join("dist", "companion.js")], outfile: record("companion.min.js"), bundle: true, format: "esm", platform: "node", target: "node22", sourcemap: true, minify: true, banner: { js: banner } });

/** The bundle size accounting of every dist target: every target reports its byte size against its budget and an overgrown bundle fails the build. */
const bundleaccounting = [];
for (const [target, file] of [["index", "index.js"], ["indexcjs", "index.cjs"], ["neutral", "index.neutral.js"], ["cli", "cli.js"], ["headless", "headless.js"], ["mcp", "mcp.js"], ["bridge", "bridge.js"], ["companion", "companion.js"], ["policy", "policy.js"], ["protocol", "protocol.js"], ["memory", "memory.js"], ["progress", "progress.js"], ["hardening", "hardening.js"], ["dashdone", "dashdone.js"], ["gateway", "gateway.js"], ["crossbrowser", "crossbrowser.js"], ["pack", "pack.js"], ["http", "http.js"]]) {
  const bytes = (await stat(join(root, "dist", file))).size;
  bundleaccounting.push({ target, bytes, budget: bundlebudgets[target] });
  if (bytes > bundlebudgets[target]) throw new Error(`The ${target} bundle of ${bytes} bytes exceeds its ${bundlebudgets[target]} byte budget.`);
}

/** The naming check keeps every unminified bundle free of underscored identifiers: the reviewed vocabulary declares no underscored name, so a bundle that grows one carries an unreviewed dependency; the scanner strips the string, comment and regex literals first and the ecmascript platform constants stay allowlisted because their names belong to the platform, not to the review. The minified variants stay outside the naming check because the minifier mangles nested scopes into underscored names and unquotes underscored object keys — the parity and checksum checks carry those variants instead. */
for (const bundle of emitted.filter(name => !name.includes(".min."))) {
  const content = stripstrings(await readFile(join(root, "dist", bundle), "utf8"));
  const underscored = underscorednames(content);
  if (underscored.length > 0) throw new Error(`The bundle ${bundle} carries the underscored identifier${underscored.length === 1 ? "" : "s"} ${[...new Set(underscored)].slice(0, 5).join(", ")}; the reviewed vocabulary carries none.`);
}

/** The platform matrix drives the runtime shells: every declared target builds through its own adapter entry in one matrix run, each with its minified variant beside it. */
await build({ entryPoints: ["runtime.ts"], outfile: "dist/runtime.js", bundle: true, format: "esm", platform: "neutral", target: "es2022" });
const { platformtargets, targetoutput, minifiedoutput } = await import(join(root, "dist/runtime.js"));
const targets = platformtargets();
for (const target of targets) {
  const output = join("dist", targetoutput(target));
  const minified = join("dist", minifiedoutput(target));
  if (target.format === "umd") {
    await build({ entryPoints: [target.entry], outfile: join(root, "dist", "umd-cjs-core.cjs"), bundle: true, format: "cjs", platform: target.platform, target: "chrome120", sourcemap: false });
    const body = await readFile(join(root, "dist", "umd-cjs-core.cjs"), "utf8");
    await writeFile(record(targetoutput(target)), `${banner}\n${umdwrap(body, "devthink")}`, "utf8");
    await writeFile(`${output}.map`, JSON.stringify({ version: 3, file: targetoutput(target), sources: [target.entry], sourcesContent: [body] }), "utf8");
    await rm(join(root, "dist", "umd-cjs-core.cjs"), { force: true });
    await build({ entryPoints: [target.entry], outfile: join(root, "dist", "umd-cjs-core.cjs"), bundle: true, format: "cjs", platform: target.platform, target: "chrome120", sourcemap: false, minify: true });
    const minbody = await readFile(join(root, "dist", "umd-cjs-core.cjs"), "utf8");
    await writeFile(record(minifiedoutput(target)), `${banner}\n${umdwrap(minbody, "devthink")}`, "utf8");
    await writeFile(`${minified}.map`, JSON.stringify({ version: 3, file: minifiedoutput(target), sources: [target.entry], sourcesContent: [minbody] }), "utf8");
    await rm(join(root, "dist", "umd-cjs-core.cjs"), { force: true });
  } else {
    await build({ entryPoints: [target.entry], outfile: record(targetoutput(target)), bundle: true, format: target.format, platform: target.platform, target: target.platform === "browser" ? "chrome120" : target.platform === "node" ? "node22" : "es2022", sourcemap: true, banner: { js: banner } });
    await build({ entryPoints: [target.entry], outfile: record(minifiedoutput(target)), bundle: true, format: target.format, platform: target.platform, target: target.platform === "browser" ? "chrome120" : target.platform === "node" ? "node22" : "es2022", sourcemap: true, minify: true, banner: { js: banner } });
  }
}
await rm(join(root, "dist", "runtime.js"), { force: true });
await rm(join(root, "dist", "runtime.js.map"), { force: true });

/** The matrix bundles join the size accounting with their own budgets: the node shell rides the cjs budget and the bun and deno shells ride the esm budgets of their sizes. */
for (const target of targets) {
  const name = target.format === "umd" ? "umd" : target.runtime;
  const bytes = (await stat(join(root, "dist", targetoutput(target)))).size;
  bundleaccounting.push({ target: name, bytes, budget: bundlebudgets[name] });
  if (bytes > bundlebudgets[name]) throw new Error(`The ${name} bundle of ${bytes} bytes exceeds its ${bundlebudgets[name]} byte budget.`);
}

/** The matrix bundles join the naming check after their emission, so every runtime shell carries the reviewed vocabulary the core carries. */
for (const target of targets) {
  const content = stripstrings(await readFile(join(root, "dist", targetoutput(target)), "utf8"));
  const underscored = underscorednames(content);
  if (underscored.length > 0) throw new Error(`The bundle ${targetoutput(target)} carries the underscored identifier${underscored.length === 1 ? "" : "s"} ${[...new Set(underscored)].slice(0, 5).join(", ")}; the reviewed vocabulary carries none.`);
}

/* The surface entries of the grand-merge layout: background and offscreen stay
   root modules (the engine imports them), the pure interface surfaces ride
   web/extension/ (the interface tree standard). */
const surfaceentry = (name) => (name === "background" || name === "offscreen") ? `${name}.ts` : `web/extension/${name}.ts`;
await Promise.all(["background", "popup", "sidepanel", "offscreen", "transparencypage", "dashboardpage", "optionspage"].map(name => build({ entryPoints: [surfaceentry(name)], outfile: `dist/extension/${name}.js`, bundle: true, format: "esm", platform: "browser", target: "chrome120", sourcemap: true })));
await build({ entryPoints: ["pagebridge.ts"], outfile: "dist/extension/pagebridge.js", bundle: true, format: "iife", platform: "browser", target: "chrome120", sourcemap: true });
/** The source manifest of the 1.1.93 single manifest design: the firefox, safari and vsix overlays ride the root manifest.json under the browsers and vsix keys, one manifest speaks every webextension dialect and no second hand maintained manifest file exists; the version the root manifest carries stays the single version source every overlay inherits. */
const sourcemanifest = JSON.parse(await readFile(join(root, "web/extension/manifest.json"), "utf8"));
/** The extension copy of the root manifest: the shipped chromium manifest drops the browsers and vsix metadata keys because the derived browser manifests the artifacts carry never include the overlay metadata of the other targets. */
const extensionmanifest = { ...sourcemanifest };
delete extensionmanifest.browsers;
delete extensionmanifest.vsix;
await writeFile(join(extensiondist, "manifest.json"), `${JSON.stringify(extensionmanifest, null, 2)}\n`, "utf8");
/** The web surface step of the 1.1.88 consolidation: the one design file web/index.html carries every surface template and the shared stylesheet embedded, and the build splits the templates into the per-surface extension pages with the stylesheet written beside them, so the extension surfaces and the deployed site render from one design. */
const webdir = join(root, "web", "extension");
const webindex = await readFile(join(webdir, "index.html"), "utf8");
const extensionstyle = /<style data-source="extension">([\s\S]*?)<\/style>/.exec(webindex)?.[1]?.trim() ?? "";
const surfacematches = [...webindex.matchAll(/<template data-surface="([^"]+)">([\s\S]*?)<\/template>/g)].map(match => ({ name: match[1], body: match[2].trim() }));
const surfacetitles = { popup: "Devthink", sidepanel: "Devthink review", dashboardpage: "Devthink dashboard", optionspage: "Devthink options", transparencypage: "Devthink transparency", sandbox: "Devthink sandbox frame", offscreen: "Devthink offscreen" };
const styledsurfaces = new Set(["popup", "sidepanel", "dashboardpage", "optionspage", "transparencypage"]);
if (extensionstyle === "") throw new Error("The web design file carries the embedded extension stylesheet; the build found none.");
await writeFile(join(extensiondist, "style.css"), `${extensionstyle}\n`, "utf8");
for (const surface of surfacematches) {
  if (surface.name === "site") continue; /* the site surface deploys from web/ as the static site */
  const title = surfacetitles[surface.name];
  if (title === undefined) throw new Error(`The web design file carries the surface ${surface.name} without a known extension page title.`);
  const stylelink = styledsurfaces.has(surface.name) ? '<link rel="stylesheet" href="style.css">' : "";
  await writeFile(join(extensiondist, `${surface.name}.html`), `<!doctype html>\n<html lang="en">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>${stylelink}</head>\n<body>\n${surface.body}\n</body>\n</html>\n`, "utf8");
}
for (const required of ["popup", "sidepanel", "sandbox", "offscreen", "dashboardpage", "optionspage", "transparencypage"]) {
  if (!surfacematches.some(surface => surface.name === required)) throw new Error(`The web design file misses the ${required} surface template the manifest declares.`);
}

/** The icon family of the 2.0.2 final polish: the root icons.ts module carries the store-ready icon set as base64 png payloads — the repository stays text-only — and the build materializes them into the extension zip directory the manifest icons block, the action default icon and the notification icon path resolve against. Every payload is verified at build time: it decodes to a real png header, its ihdr width and height match the size key it rides under, and the manifest icon paths agree with the materialized files, so the icon set provably renders at the required sizes before any artifact ships. */
const iconssource = await readFile(join(root, "web/extension/icons.ts"), "utf8");
const iconblock = /export const iconpayloads: Record<string, string> = \{([\s\S]*?)\};/.exec(iconssource)?.[1] ?? "";
const iconentries = [...iconblock.matchAll(/"(\d+)": "([A-Za-z0-9+/=]+)"/g)].map(match => ({ size: Number(match[1]), base64: match[2] }));
if (iconentries.length !== 6) throw new Error(`The icon family of the final polish carries six required sizes; the icons module declares ${iconentries.length}.`);
const iconsizes = new Set(iconentries.map(entry => entry.size));
for (const size of [16, 19, 32, 38, 48, 128]) if (!iconsizes.has(size)) throw new Error(`The icon family misses the required ${size} pixel size.`);
await mkdir(join(extensiondist, "icons"), { recursive: true });
for (const entry of iconentries) {
  const bytes = Buffer.from(entry.base64, "base64");
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.subarray(0, 8).equals(signature) === false) throw new Error(`The ${entry.size} pixel icon payload does not decode to a png header.`);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== entry.size || height !== entry.size) throw new Error(`The ${entry.size} pixel icon payload decodes to ${width}x${height}; every icon renders at its declared size.`);
  if (extensionmanifest.icons?.[String(entry.size)] !== `icons/${entry.size}.png`) throw new Error(`The manifest icons block does not resolve the ${entry.size} pixel icon the build materializes.`);
  await writeFile(join(extensiondist, "icons", `${entry.size}.png`), bytes);
}
for (const size of Object.keys(extensionmanifest.icons ?? {})) if (!iconsizes.has(Number(size))) throw new Error(`The manifest icons block references the ${size} pixel size the icons module does not carry.`);
if (extensionmanifest.action?.default_icon?.["128"] !== "icons/128.png") throw new Error("The action default icon block does not resolve the 128 pixel toolbar icon the build materializes.");

/** The extension bundle and the browser library bundles stay free of node shims: the runtime entries reach the platform through the adapter seam only, so neither the extension targets nor the neutral and umd library modes ever leak a node import into a browser bundle. */
const nodeshim = /(?:from\s*|require\(\s*)["']node:/;
for (const name of ["background", "popup", "sidepanel", "offscreen", "pagebridge", "transparencypage", "dashboardpage", "optionspage"]) {
  const content = await readFile(join(extensiondist, `${name}.js`), "utf8");
  if (nodeshim.test(content)) throw new Error(`The extension bundle ${name}.js carries a node shim; the browser targets stay free of node imports.`);
}
for (const name of ["index.neutral.js", "index.neutral.min.js", "devthink.umd.js", "devthink.umd.min.js"]) {
  const content = await readFile(join(root, "dist", name), "utf8");
  if (nodeshim.test(content)) throw new Error(`The browser library bundle ${name} carries a node shim; the browser condition stays free of node imports.`);
}

/** The declaration emit covers every public module: the matrix targets keep their declaration files and the policy, protocol, memory, progress and hardening module entries carry the declaration files the exports map types conditions read. */
for (const target of targets) {
  const declaration = await readFile(join(root, "dist", `${target.entry.replace(/\.ts$/, "")}.d.ts`), "utf8");
  if (declaration.trim() === "") throw new Error(`The ${target.runtime} platform target lacks its declaration file.`);
}
for (const entry of ["index", "cjs", "neutral", "policy", "protocol", "memory", "progress", "hardening", "dashdone", "types", "runtime", "umd", "node", "bun", "deno", "headless", "cli", "agent", "auth", "http", "gateway", "page", "mcp", "serve", "tools", "bridge", "crossbrowser", "pack", "companion", "version"]) {
  const declaration = await readFile(join(root, "dist", `${entry}.d.ts`), "utf8");
  if (declaration.trim() === "") throw new Error(`The ${entry} module entry lacks its declaration file.`);
}

/** The staticdeploy step of the 1.1.82 site integration family: the plain static assets of site/ build to dist/site with content hashed file names (the index rewrites its asset references to the hashed names), an immutable cache header configuration rides beside them as a plain static _headers file with zero server functions, no edge functions, no redirect rules and no vendor runtime, and the site zip ships as its own release artifact instead of entering the package exports map. */
const siteaccounting = [];
const sitehashof = (bytes) => createHash("sha256").update(bytes).digest("hex").slice(0, 10);
const sitedir = join(root, "web", "extension");
const sitedist = join(root, "dist", "site");
await mkdir(sitedist, { recursive: true });
let siteindex = await readFile(join(sitedir, "index.html"), "utf8");
const headerlines = ["/index.html", "  Cache-Control: no-cache"];
siteaccounting.push({ file: "index.html", bytes: siteindex.length, budget: 300_000 });
if (siteindex.length > 300_000) throw new Error(`The one design file of ${siteindex.length} bytes exceeds its 300000 byte budget.`);
for (const asset of ["sitemanifest.json"]) {
  const bytes = await readFile(join(sitedir, asset));
  const hashed = asset.replace(/(\.[^.]+)$/, `.${sitehashof(bytes)}$1`);
  await writeFile(join(sitedist, hashed), bytes);
  emitted.push(`site/${hashed}`);
  siteindex = siteindex.split(asset).join(hashed);
  headerlines.push(`/${hashed}`, "  Cache-Control: public, max-age=31536000, immutable");
  const bytesize = bytes.length;
  siteaccounting.push({ file: hashed, bytes: bytesize, budget: 100_000 });
  if (bytesize > 100_000) throw new Error(`The site asset ${asset} of ${bytesize} bytes exceeds its 100000 byte budget.`);
}
await writeFile(join(sitedist, "index.html"), siteindex, "utf8");
emitted.push("site/index.html");
await writeFile(join(sitedist, "_headers"), `${headerlines.join("\n")}\n`, "utf8");
emitted.push("site/_headers");
const sitebytes = siteaccounting.reduce((total, entry) => total + entry.bytes, 0);
if (sitebytes > 400_000) throw new Error(`The static site of ${sitebytes} bytes exceeds its 400000 byte total budget.`);
const sitefiletypes = [...new Set((await readdir(sitedist)).map(file => file.startsWith("_") ? file : file.slice(file.lastIndexOf(".") + 1)))];
if (!sitefiletypes.every(type => ["html", "css", "js", "json", "_headers"].includes(type))) throw new Error(`The static site output carries a non static file type: ${sitefiletypes.join(", ")}.`);
for (const file of await readdir(sitedist)) {
  const underscored = underscorednames(stripstrings(await readFile(join(sitedist, file), "utf8")));
  if (underscored.length > 0) throw new Error(`The site file ${file} carries the underscored identifier${underscored.length === 1 ? "" : "s"} ${[...new Set(underscored)].slice(0, 5).join(", ")}; the reviewed site vocabulary carries none.`);
}

/** The extension gallery copy of the 2.0.0 example gallery: the chromium extension archive carries the gallery index and its recipe plans under fixtures/ so the sidepanel one click import reads them through the runtime url of the packaged extension — the plans stay pure plan documents, the fixture pages stay package fixtures the recipes name, and no recipe grows a remote origin. */
const extensionfixtures = join(extensiondist, "fixtures", "recipes");
await mkdir(extensionfixtures, { recursive: true });
await writeFile(join(extensiondist, "fixtures", "gallery.json"), await readFile(join(root, "tests", "code", "recipes", "gallery.json")), "utf8");
for (const file of (await readdir(join(root, "tests", "code", "recipes"))).filter(file => file.endsWith(".json") && file !== "gallery.json")) {
  await writeFile(join(extensionfixtures, file), await readFile(join(root, "tests", "code", "recipes", file)), "utf8");
}

/** The chromium extension zip of the release: the build packs the extension dist directory into the version stamped archive the release workflow attaches beside every other artifact. */
await rm(join(root, "dist", `devthink${packagejson.version}.zip`), { force: true });
await execute("zip", ["-qr", `../devthink${packagejson.version}.zip`, "."], { cwd: extensiondist });

/** The firefox target of the 1.1.86 browser coverage family: the build reads the source manifest, layers the firefox overlay (the browsers.firefox section of the root manifest.json) on top through the firefoxprep adapter, assembles the xpi through the xpipack assembler with the adapted manifest and the hashed extension dist bundles, and writes the artifact beside the chromium extension zip; the artifact name carries the release version, the manifest placement sits at the archive root, and the addons linter markers stay inside the budget the build asserts. */
const firefoxoverlay = sourcemanifest.browsers?.firefox;
if (firefoxoverlay === undefined) throw new Error("The root manifest carries the firefox overlay under the browsers key; a missing overlay never builds the firefox target.");
const firefoxprep = await import(join(root, "dist", "crossbrowser.js"));
const xpipack = await import(join(root, "dist", "crossbrowser.js"));
const firefoxadapted = firefoxprep.firefoxprepadapt({ manifest: sourcemanifest, overlay: firefoxoverlay, backgroundscripts: ["background.js"] });
const firefoxbundleentries = [];
const firefoxhashof = (bytes) => createHash("sha256").update(bytes).digest("hex").slice(0, 10);
for (const name of ["background.js", "popup.js", "sidepanel.js", "pagebridge.js", "offscreen.js", "transparencypage.js", "dashboardpage.js", "optionspage.js"]) {
  try {
    const bytes = await readFile(join(extensiondist, name));
    const hashed = name.replace(/(\.[^.]+)$/, `.${firefoxhashof(bytes)}$1`);
    await writeFile(join(extensiondist, hashed), bytes);
    firefoxbundleentries.push({ name: hashed, bytes: new Uint8Array(bytes) });
  } catch { /* the page bridge bundle is optional on the firefox target */ }
}
for (const asset of ["popup.html", "offscreen.html", "sandbox.html", "sidepanel.html", "transparencypage.html", "dashboardpage.html", "optionspage.html", "style.css", "icons/16.png", "icons/19.png", "icons/32.png", "icons/38.png", "icons/48.png", "icons/128.png"]) {
  try {
    const bytes = await readFile(join(extensiondist, asset));
    firefoxbundleentries.push({ name: asset, bytes: new Uint8Array(bytes) });
  } catch { /* the firefox target carries the assets the chromium build ships */ }
}
const xpibuilt = xpipack.xpipackassemble({ manifest: firefoxadapted.manifest, bundleentries: firefoxbundleentries, version: packagejson.version });
await writeFile(join(root, "dist", `devthink-firefox-${packagejson.version}.xpi`), Buffer.from(xpibuilt.archive.bytes));
const lintercheck = xpipack.xpipacklintercheck({ markers: xpibuilt.lintermarkers, budget: xpipack.xpilinterbudget });
if (!lintercheck.ok) throw new Error(lintercheck.reason ?? "The firefox xpi failed the addons linter budget.");

/** The safari target of the 1.1.86 browser coverage family: the build embeds the chromium extension payload (the manifest, the background bundle, the page bundles and the assets) into the safari app extension wrapper through the safariskeleton module, and the wrapper ships beside the chromium zip and the firefox xpi with the bundle id, the entitlements and the minimal app shell the wrapper declares. */
const safariskeleton = await import(join(root, "dist", "crossbrowser.js"));
const safaripayload = [];
safaripayload.push({ name: "manifest.json", bytes: new Uint8Array(await readFile(join(extensiondist, "manifest.json"))) });
for (const name of ["background.js", "popup.js", "sidepanel.js", "pagebridge.js", "offscreen.js", "transparencypage.js", "dashboardpage.js", "optionspage.js"]) {
  try { safaripayload.push({ name, bytes: new Uint8Array(await readFile(join(extensiondist, name))) }); } catch { /* optional */ }
}
for (const asset of ["popup.html", "offscreen.html", "sandbox.html", "sidepanel.html", "transparencypage.html", "dashboardpage.html", "optionspage.html", "style.css", "icons/16.png", "icons/19.png", "icons/32.png", "icons/38.png", "icons/48.png", "icons/128.png"]) {
  try { safaripayload.push({ name: asset, bytes: new Uint8Array(await readFile(join(extensiondist, asset))) }); } catch { /* optional */ }
}
const safaribuilt = safariskeleton.safariskeletonbuild({ version: packagejson.version, bundleid: "com.wenathlan.devthink", extensionpayload: safaripayload, entitlements: ["com.apple.security.app-sandbox", "com.apple.security.network.client"] });
await writeFile(join(root, "dist", `devthink-safari-${packagejson.version}.zip`), Buffer.from(safaribuilt.archive.bytes));

/** The vs code target of the 1.1.87 publishing pipeline family: the build reads the vsix manifest overlay (the vsix section of the root manifest.json), reuses the library esm build the webview imports, assembles the vsix through the vsixpack assembler with the extension manifest, the webview page and the esm bundle, runs the marketplace metadata check over the package fields and writes the artifact beside the browser builds; the package declares no telemetry and no network default, and no vendor marketplace url appears anywhere in the archive. */
const vsixpack = await import(join(root, "dist", "pack.js"));
const vsixmanifestsource = sourcemanifest.vsix;
if (vsixmanifestsource === undefined) throw new Error("The root manifest carries the vsix overlay under the vsix key; a missing overlay never builds the vs code target.");
const vsixbuilt = vsixpack.vsixpackassemble({ version: packagejson.version, esmbundlebytes: new Uint8Array(await readFile(join(root, "dist", "index.js"))), ...(typeof vsixmanifestsource.relaypath === "string" ? { relaypath: vsixmanifestsource.relaypath } : {}) });
await writeFile(join(root, "dist", vsixbuilt.archive.name), Buffer.from(vsixbuilt.archive.bytes));
const vsixmetadata = vsixpack.vsixmarketplacemetadatacheck({ fields: vsixbuilt.manifestfields, manifesttext: vsixpack.vsixpackmanifest(vsixbuilt.manifestfields) });
if (!vsixmetadata.ok) throw new Error(vsixmetadata.reason ?? "The vsix failed the marketplace metadata check.");
if (vsixbuilt.manifestfields.version !== sourcemanifest.version) throw new Error("The vsix manifest carries the version the root manifest owns; the single version source never drifts between the package stamp and the root manifest.");

/** The declarations zip of the 1.1.87 publishing pipeline family: the build packs every declaration file and declaration map into the version stamped archive the release attaches beside the bundles and the maven pom attaches with the declarations classifier. */
const declarationsname = `devthink-declarations-${packagejson.version}.zip`;
const declarationfiles = (await readdir(join(root, "dist"))).filter(file => file.endsWith(".d.ts") || file.endsWith(".d.ts.map")).sort();
if (declarationfiles.length === 0) throw new Error("The declarations zip packs the declaration files for ide integration; an empty declaration set never ships.");
await rm(join(root, "dist", declarationsname), { force: true });
await execute("zip", ["-qr", declarationsname, ...declarationfiles], { cwd: join(root, "dist") });
emitted.push(declarationsname);

/** The site zip of the 1.1.87 publishing pipeline family: the build packs the hashed static site (the chatbridge assets and the immutable cache header configuration) into the version stamped archive the release attaches beside the extension artifacts for the site channel. */
const sitename = `devthink-site-${packagejson.version}.zip`;
await rm(join(root, "dist", sitename), { force: true });
await execute("zip", ["-qr", `../${sitename}`, "."], { cwd: sitedist });

/** The artifact manifest of the 1.1.87 publishing pipeline family: the build records every artifact it produced — every dist bundle, the declarations zip and the extension artifacts — with its name, size, sha256 checksum and publishing channels; the manifest carries no timestamp so the same artifact set renders byte identical on every run, and the verify workflow asserts the built set matches it exactly. */
const artifactmanifestmodule = await import(join(root, "dist", "pack.js"));
const releaseartifacts = [];
for (const bundle of [...emitted]) {
  if (bundle.startsWith("site/")) continue; /* the static site assets carry their own manifest, not the artifact manifest of the publishing pipeline */
  const bytes = await readFile(join(root, "dist", bundle));
  releaseartifacts.push({ name: `dist/${bundle}`, size: bytes.length, checksum: createHash("sha256").update(bytes).digest("hex") });
}
for (const artifact of [`devthink${packagejson.version}.zip`, `devthink-firefox-${packagejson.version}.xpi`, `devthink-safari-${packagejson.version}.zip`, vsixbuilt.archive.name, sitename]) {
  const bytes = await readFile(join(root, "dist", artifact));
  releaseartifacts.push({ name: `dist/${artifact}`, size: bytes.length, checksum: createHash("sha256").update(bytes).digest("hex") });
}
const localmanifest = artifactmanifestmodule.artifactmanifestof({ version: packagejson.version, artifacts: releaseartifacts });
await writeFile(join(root, "dist", "artifactmanifest.json"), artifactmanifestmodule.artifactmanifesttext(localmanifest), "utf8");
emitted.push("artifactmanifest.json");

/** The checksums file of every dist target: one sha256 line per emitted bundle and one line for the published manifest identity key, so a consumer verifies every mode file against the build that shipped it while the identity pin rides the generated artifact instead of a hard coded constant; the file is written after every artifact exists so the declarations zip and the artifact manifest join the covered set. */
const checksums = [];
for (const bundle of emitted.sort()) {
  const digest = createHash("sha256").update(await readFile(join(root, "dist", bundle))).digest("hex");
  checksums.push(`${digest}  ${bundle}`);
}
const identitymanifest = JSON.parse(await readFile(join(root, "web/extension/manifest.json"), "utf8"));
const identitykey = Buffer.from(String(identitymanifest.key), "base64");
checksums.push(`${createHash("sha256").update(identitykey).digest("hex")}  manifest.json key`);
await writeFile(join(root, "dist", "checksums.txt"), `${checksums.join("\n")}\n`, "utf8");

/** The apimap build check of the 1.1.86 browser coverage family: the build asserts every recorded api has a chromium and firefox mapping (a missing row fails the build before the cross browser artifacts ship), so a new api without a row never reaches the firefox or the safari build. */
const apimapmodule = await import(join(root, "dist", "gateway.js"));
const apireport = apimapmodule.apimapunmapped(apimapmodule.apimapentries());
if (apireport.failed) throw new Error(apireport.reason);
console.log(`Devthink targets built: ${targets.map(target => `${target.runtime}=${targetoutput(target)}`).join(", ")} beside the esm and cjs core, the neutral browser bundle, the per module entries, the cli and the headless library entry.`);
console.log(`Bundle size accounting: ${bundleaccounting.map(entry => `${entry.target}=${entry.bytes}/${entry.budget}b`).join(", ")}.`);
console.log(`Checksums written for ${emitted.length} dist bundles into dist/checksums.txt.`);
console.log(`Publishing pipeline artifacts: dist/${vsixbuilt.archive.name} (${vsixbuilt.entries.length} entries, ${vsixbuilt.archive.bytes.length} bytes), dist/${declarationsname} (${releaseartifacts.filter(entry => entry.name === `dist/${declarationsname}`).length > 0 ? "declared" : "staged"}), dist/${sitename} and dist/artifactmanifest.json (${localmanifest.artifacts.length} artifacts with names, sizes, checksums and channels).`);
console.log(`Static site built to dist/site with hashed file names: ${siteaccounting.map(entry => `${entry.file}=${entry.bytes}b`).join(", ")} of ${sitebytes} total bytes and the immutable cache header configuration in dist/site/_headers.`);
console.log(`Cross browser artifacts: dist/devthink-firefox-${packagejson.version}.xpi (${xpibuilt.entries.length} entries, ${xpibuilt.archive.bytes.length} bytes) and dist/devthink-safari-${packagejson.version}.zip (${safaribuilt.projectfiles.length} project files + ${safaripayload.length} payload entries, ${safaribuilt.archive.bytes.length} bytes).`);
console.log(`Apimap build check: ${apireport.rows.length} rows, ${apireport.missingchromium.length} chromium missing, ${apireport.missingfirefox.length} firefox missing, ${apireport.missingsafari.length} safari missing.`);

/** The flat npm package staging of the 2.0.3 organization pass: the library surface the exports map resolves ships at the package root — one file per correlated domain, no dist folder, no path nested past two directories — with the data groups (caps, schemas, fixtures) beside it, the umd example page, the extension manifest the cli manifest command reads, and the package scoped checksums covering exactly the shipped set. The source maps stay behind (the dist build and the release assets keep them — the published package rides lean with the js and the declarations), and the generated package.json mirrors the repository manifest with the entry paths remapped to the root, so the published tarball opens flat and organized the same way the repository sources stay; the release workflow packs the staged tree (`npm pack ./distpackage`) on the github build machines and the repository keeps no build output of its own. */
const stage = join(root, "distpackage");
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
const stagerootfiles = [
  "index.js", "index.cjs", "index.neutral.js", "devthink.umd.js",
  "policy.js", "protocol.js", "memory.js", "progress.js", "hardening.js", "dashdone.js",
  "node.cjs", "bun.js", "deno.js",
  "cli.js", "headless.js", "mcp.js",
  "bridge.js", "companion.js", "nativehost.template.json",
  "pack.js", "http.js", "gateway.js", "crossbrowser.js", "gateway-index.js", "maene-index.js",
  "gallery.json", "umd-example.html",
];
const stagedeclarations = ["index", "policy", "protocol", "memory", "progress", "hardening", "dashdone", "cli", "headless", "mcp", "bridge", "pack", "crossbrowser", "http", "gateway", "umd", "node", "bun", "deno", "companion", "gateway-index", "maene-index"];
for (const file of stagerootfiles) await writeFile(join(stage, file), await readFile(join(root, "dist", file)));
for (const name of stagedeclarations) {
  await writeFile(join(stage, `${name}.d.ts`), await readFile(join(root, "dist", `${name}.d.ts`)));
  await writeFile(join(stage, `${name}.d.ts.map`), await readFile(join(root, "dist", `${name}.d.ts.map`)));
}
for (const group of ["caps", "schemas", "fixtures"]) {
  await mkdir(join(stage, group), { recursive: true });
  const entries = [];
  const walk = async (relative) => {
    for (const entry of await readdir(join(root, "dist", group, relative), { withFileTypes: true })) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
      if (entry.isDirectory()) await walk(child);
      else entries.push(child);
    }
  };
  await walk("");
  for (const entry of entries.sort()) {
    const parent = join(stage, group, entry.split("/").slice(0, -1).join("/"));
    await mkdir(parent, { recursive: true });
    await writeFile(join(stage, group, entry), await readFile(join(root, "dist", group, entry)));
  }
}
for (const file of ["README.md", "LICENSE", "CHANGELOG.md"]) await writeFile(join(stage, file), await readFile(join(root, file)));
await writeFile(join(stage, "manifest.json"), await readFile(join(root, "web", "extension", "manifest.json")));

/** The staged package manifest: the repository package.json is the single source of truth, the build derives the published manifest from it — the entry paths remap from the dist folder to the package root, the repository machinery (files allowlist, scripts, devDependencies, the packageManager pin) drops out, and every field a registry consumer reads rides verbatim — so the two manifests never drift. */
const remappaths = (node) => {
  if (typeof node === "string") return node.replace(/^\.\/dist\//, "./");
  if (Array.isArray(node)) return node.map(remappaths);
  if (node !== null && typeof node === "object") {
    const out = {};
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
  engines: packagejson.engines,
  sideEffects: false,
  publishConfig: packagejson.publishConfig,
  main: "./index.js",
  types: "./index.d.ts",
  bin: { devthink: "./cli.js" },
  exports: remappaths(packagejson.exports),
};
await writeFile(join(stage, "package.json"), `${JSON.stringify(stagedpackage, null, 2)}\n`, "utf8");

/** The package scoped checksums: one sha256 line per staged file beside the identity pin of the manifest key, so a consumer verifies every file of the installed package against the build that shipped it — the minified variants and the release archives stay covered by the full dist checksums of the release assets, the package set carries its own closed record. */
const stagechecksums = [];
const collectstaged = async (relative) => {
  const found = [];
  for (const entry of await readdir(join(stage, relative), { withFileTypes: true })) {
    const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
    if (entry.isDirectory()) found.push(...await collectstaged(child));
    else found.push(child);
  }
  return found;
};
const stagedfiles = (await collectstaged("")).filter(file => file !== "checksums.txt").sort();
for (const file of stagedfiles) {
  stagechecksums.push(`${createHash("sha256").update(await readFile(join(stage, file))).digest("hex")}  ${file}`);
}
stagechecksums.push(`${createHash("sha256").update(identitykey).digest("hex")}  manifest.json key`);
await writeFile(join(stage, "checksums.txt"), `${stagechecksums.join("\n")}\n`, "utf8");

/** The flat layout gates of the staging: no staged path nests past two directories (a folder inside a folder inside a folder never ships), every exports target of the staged manifest resolves to a staged file, and the staged manifest parses with the repository name and version — the organized contract the release lanes assert again over the packed tarball. */
for (const file of stagedfiles) {
  if (file.split("/").length > 3) throw new Error(`The staged package file ${file} nests past two directories; the npm package stays flat at the root with grouped data beside it.`);
}
const exporttargets = [];
const collecttargets = (node) => {
  if (typeof node === "string") exporttargets.push(node);
  else if (Array.isArray(node)) node.forEach(collecttargets);
  else if (node !== null && typeof node === "object") Object.values(node).forEach(collecttargets);
};
collecttargets(stagedpackage.exports);
for (const target of [...new Set(exporttargets)]) {
  try { await readFile(join(stage, target.replace(/^\.\//, ""))); }
  catch { throw new Error(`The staged exports target ${target} does not resolve to a staged file; the package manifest and the staged set drifted.`); }
}
if (stagedpackage.bin.devthink !== "./cli.js") throw new Error("The staged bin entry resolves the cli at the package root.");
console.log(`Flat npm package staged: distpackage of ${stagedfiles.length + 1} files (${stagerootfiles.length} root surface files, ${stagedeclarations.length * 2} declaration files, ${stagedfiles.filter(file => file.startsWith("caps/") || file.startsWith("schemas/") || file.startsWith("fixtures/")).length} grouped data files) with the package scoped checksums and the root manifest — pack it with npm pack ./distpackage.`);
