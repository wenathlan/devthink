/**
 * build-lib — npm library bundle of the @wenathlan/devthink gateway family
 * one file one responsibility — only the lib build orchestration lives here
 *
 * produces inside dist/ (beside the extension bundles tests/build.mjs emits):
 *   gateway-index.js   esm library entry of the gateway barrel (the gateway library surface)
 *   engine.js          esm engine entry
 *   gateway-http.js    esm embeddable http transport entry (server + stream)
 *   gateway-cli.js     esm cli entry with the node shebang (the family bin)
 *   *.d.ts             declarations of the gateway family modules
 *
 * the merged module names ride the entries: the gateway lineage landed with
 * http.ts renamed to gateway-http.ts and cli.ts renamed to gateway-cli.ts,
 * and the library barrel lives in gateway-index.ts beside the neutral
 * extension surface the root index.ts freezes — the gateway family entries
 * never collide with the extension dist targets.
 *
 * run order: tests/build.mjs FIRST (the root build), then this script.
 * the package is esm only — node engine floor, no cjs output.
 */

import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const root = process.cwd();

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: root });
}

// --- esm entries -----------------------------------------------------------

run(
  "bun build gateway-index.ts engine.ts --target=node --format=esm --packages=external --outdir dist",
);
console.log("[build-lib] esm entries bundled: gateway-index engine");

// gateway-http.ts is built as its own single entry: bun dedupes an entry that
// another entry imports (gateway-index.ts re-exports from ./gateway-http), so
// bundling it alongside the others would skip the file. a dedicated invocation
// always emits the transport bundle.
run(
  "bun build gateway-http.ts --target=node --format=esm --packages=external --outfile dist/gateway-http.js",
);
console.log("[build-lib] esm http transport bundled");

// --- cli entry with the node shebang ---------------------------------------

run(
  "bun build gateway-cli.ts --target=node --format=esm --packages=external --outfile dist/gateway-cli.js",
);
// bun writes its own "#!/usr/bin/env bun" first line; replace it with the
// node shebang so the bin works under plain node installs.
const clipath = `${root}/dist/gateway-cli.js`;
let clitext = readFileSync(clipath, "utf8");
clitext = clitext.replace(/^#!.*\n/, "#!/usr/bin/env node\n");
writeFileSync(clipath, clitext);
chmodSync(clipath, 0o755);
console.log("[build-lib] cli entry bundled with the node shebang");

// --- declarations ----------------------------------------------------------
// the declaration pass emits the gateway family modules beside the extension
// declarations tests/build.mjs already wrote (the barrel re-exports the types
// the shared types.ts module carries, so no separate types entry builds).

run(
  "bunx tsc --ignoreConfig --types node --target es2022 --module esnext --moduleResolution bundler --strict --exactOptionalPropertyTypes --emitDeclarationOnly --declaration --outDir dist gateway-index.ts engine.ts gateway-auth.ts gateway-configloader.ts database.ts utils.ts gateway-http.ts gateway-cli.ts",
);
console.log("[build-lib] declarations emitted to dist");

// --- sanity ----------------------------------------------------------------

const required = [
  "dist/gateway-index.js",
  "dist/engine.js",
  "dist/gateway-http.js",
  "dist/gateway-cli.js",
  "dist/gateway-index.d.ts",
  "dist/engine.d.ts",
  "dist/gateway-http.d.ts",
  "dist/gateway-cli.d.ts",
];
const missing = required.filter((p) => !existsSync(`${root}/${p}`));
if (missing.length > 0) {
  console.error(`[build-lib] missing bundle artifacts: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("[build-lib] library bundle complete");
