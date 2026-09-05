/**
 * build-lib — npm library bundle for @wenathlan/gateway
 * one file one responsibility — only the lib build orchestration lives here
 *
 * produces inside dist/ (after vite build wrote the web console):
 *   index.js     esm library entry (main)
 *   http.js      esm embeddable http transport entry (server + stream)
 *   engine.js    esm engine entry
 *   types.js     esm types entry
 *   cli.js       esm cli entry with the node shebang (bin)
 *   *.d.ts       declarations from tsconfig.lib.json
 *
 * run order: vite build FIRST (it empties dist), then this script.
 * the package is esm only — node 22.18+ engine floor, no cjs output.
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
  "bun build index.ts engine.ts types.ts --target=node --format=esm --packages=external --outdir dist",
);
console.log("[build-lib] esm entries bundled: index engine types");

// http.ts is built as its own single entry: bun dedupes an entry that
// another entry imports (index.ts re-exports from ./http), so bundling
// it alongside the others would skip the file. a dedicated invocation
// always emits the transport bundle.
run(
  "bun build http.ts --target=node --format=esm --packages=external --outfile dist/http.js",
);
console.log("[build-lib] esm http transport bundled");

// --- cli entry with the node shebang ---------------------------------------

run(
  "bun build cli.ts --target=node --format=esm --packages=external --outfile dist/cli.js",
);
// bun writes its own "#!/usr/bin/env bun" first line; replace it with the
// node shebang so the bin works under plain node installs.
const clipath = `${root}/dist/cli.js`;
let clitext = readFileSync(clipath, "utf8");
clitext = clitext.replace(/^#!.*\n/, "#!/usr/bin/env node\n");
writeFileSync(clipath, clitext);
chmodSync(clipath, 0o755);
console.log("[build-lib] cli entry bundled with the node shebang");

// --- declarations ----------------------------------------------------------

run("bunx tsc -p tsconfig.lib.json");
console.log("[build-lib] declarations emitted to dist");

// --- sanity ----------------------------------------------------------------

const required = [
  "dist/index.js",
  "dist/http.js",
  "dist/engine.js",
  "dist/types.js",
  "dist/cli.js",
  "dist/index.d.ts",
  "dist/http.d.ts",
  "dist/engine.d.ts",
  "dist/types.d.ts",
];
const missing = required.filter((p) => !existsSync(`${root}/${p}`));
if (missing.length > 0) {
  console.error(`[build-lib] missing bundle artifacts: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("[build-lib] library bundle complete");
